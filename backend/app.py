import os
import logging
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load backend secrets from both backend/.env and root .env
backend_env_path = os.path.join(os.path.dirname(__file__), ".env")
root_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(root_env_path)
load_dotenv(backend_env_path, override=False)

from auth import require_auth
from database import (
    init_db,
    save_report_to_db,
    get_user_reports_from_db,
    get_report_by_id,
    save_chat_message,
    get_chat_history,
    clear_chat_history
)
from chat_service import process_chat_message
from pdf_service import (
    extract_text_from_pdf,
    extract_structured_pdf
)
from report_classifier import classify_report
from biomarker_service import analyze_biomarkers
from analysis_service import analyze_report
from imaging_service import analyze_imaging_report
from gemini_ocr_service import extract_pdf_with_gemini
from translation_service import normalize_language, SUPPORTED_LANGUAGES

# Configure server logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("health_interpreter_api")

app = Flask(__name__)

# Parse comma-separated authorized origins from CLERK_AUTHORIZED_PARTIES
raw_azp = os.getenv("CLERK_AUTHORIZED_PARTIES", "http://localhost:5173")
authorized_origins = []
for origin in raw_azp.split(","):
    origin = origin.strip()
    if origin:
        authorized_origins.append(
            origin if "://" in origin else f"https://{origin}"
        )
authorized_origins = authorized_origins or ["http://localhost:5173"]

# Restrict CORS to authorized frontend origins with explicit headers
CORS(
    app,
    resources={r"/*": {"origins": authorized_origins}},
    allow_headers=["Authorization", "Content-Type"],
    methods=["GET", "POST", "DELETE", "OPTIONS"],
    supports_credentials=True
)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"pdf"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize database schema (PostgreSQL with SQLite local dev fallback)
init_db()


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@app.route("/", methods=["GET"])
def home():
    """
    Public backend health check endpoint.
    """
    return jsonify({
        "status": "healthy",
        "message": "AI Health Report Interpreter backend is running"
    })


@app.route("/upload", methods=["POST"])
@require_auth
def upload_report():
    """
    Protected PDF upload and clinical analysis endpoint.
    Requires a valid Clerk session token.
    """
    if "file" not in request.files:
        return jsonify({"error": "No PDF file was uploaded."}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file was selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are supported."}), 400

    filename = secure_filename(file.filename)

    # Use verified Clerk user ID for isolated storage path when available
    user_id = getattr(g, "user_id", None)
    if user_id:
        user_folder = os.path.join(app.config["UPLOAD_FOLDER"], secure_filename(user_id))
        os.makedirs(user_folder, exist_ok=True)
        file_path = os.path.join(user_folder, filename)
    else:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    file.save(file_path)

    try:
        # Normalize language: accept both ISO codes ("hi") and
        # legacy full names ("Hindi"). Defaults to "en".
        raw_language = request.form.get("language", "en").strip() or "en"
        lang = normalize_language(raw_language)

        # Map ISO code to English name for Gemini prompt
        LANGUAGE_DISPLAY_NAMES = {
            "en": "English", "hi": "Hindi", "te": "Telugu",
            "ta": "Tamil", "kn": "Kannada", "ml": "Malayalam",
            "mr": "Marathi", "bn": "Bengali",
        }
        response_language = LANGUAGE_DISPLAY_NAMES.get(lang, "English")

        gemini_extraction = None
        try:
            gemini_extraction = extract_pdf_with_gemini(
                file_path,
                response_language=response_language
            )
        except Exception as error:
            logger.warning(
                "Gemini OCR fallback triggered. Reason: %s",
                type(error).__name__
            )

        if gemini_extraction:
            gemini_report_type = gemini_extraction["report_type"]
            has_incomplete_output = (
                (gemini_report_type == "laboratory"
                 and not gemini_extraction["biomarkers"])
                or (gemini_report_type == "imaging"
                    and len(gemini_extraction["text"]) < 40)
                or (gemini_report_type == "general"
                    and len(gemini_extraction["text"]) < 120)
            )
            if has_incomplete_output:
                logger.info(
                    "Gemini OCR output incomplete; falling back to local extraction."
                )
                gemini_extraction = None

        extracted_text = (
            gemini_extraction["text"]
            if gemini_extraction and gemini_extraction["text"]
            else extract_text_from_pdf(file_path)
        )
        ocr_source = "Gemini" if gemini_extraction else "Tesseract"

        if not extracted_text.strip():
            return jsonify({
                "error": "Could not extract readable content from this PDF."
            }), 400

        if gemini_extraction:
            structured_page_count = gemini_extraction["page_count"]
            structured_pdf = None
        else:
            structured_pdf = extract_structured_pdf(file_path)
            structured_page_count = len(structured_pdf.get("pages", []))

        report_type = (
            gemini_extraction["report_type"]
            if gemini_extraction
            else classify_report(extracted_text)
        )

        # Separate analysis paths for laboratory and imaging reports.
        if report_type == "imaging":
            report_analysis = analyze_imaging_report(extracted_text, lang=lang)
        else:
            biomarkers = []
            if report_type == "laboratory":
                biomarkers = (
                    gemini_extraction["biomarkers"]
                    if gemini_extraction
                    else analyze_biomarkers(structured_pdf)
                )

            report_analysis = analyze_report(biomarkers, lang=lang)
            report_analysis["report_type"] = report_type
            report_analysis["findings"] = []

        if gemini_extraction and gemini_extraction.get("overall_impression"):
            report_analysis["impression"] = gemini_extraction["overall_impression"]

        # Server-side diagnostic metrics without logging report contents or tokens
        logger.info(
            "Report processed successfully for user %s | file=%s | ocr=%s | type=%s | lang=%s | biomarkers=%d | findings=%d",
            user_id or "anonymous",
            filename,
            ocr_source,
            report_type,
            lang,
            len(report_analysis.get("biomarkers", [])),
            len(report_analysis.get("findings", []))
        )

        analysis_payload = {
            "report_type": report_type,
            "biomarkers": report_analysis.get("biomarkers", []),
            "findings": report_analysis.get("findings", []),
            "patterns": report_analysis.get("patterns", []),
            "impression": report_analysis.get("impression", ""),
            "concern_level": report_analysis.get("concern_level", {}),
            "knowledge": report_analysis.get("knowledge", []),
            "doctor_questions": report_analysis.get("doctor_questions", [])
        }

        # Persist report in PostgreSQL database
        saved_report = None
        if user_id:
            try:
                saved_report = save_report_to_db(
                    user_id=user_id,
                    filename=filename,
                    report_type=report_type,
                    language=lang,
                    analysis=analysis_payload
                )
            except Exception as db_save_err:
                logger.error("Failed to persist report to database: %s", db_save_err)

        report_id = saved_report.get("id") if saved_report else None

        return jsonify({
            "message": "Report processed successfully",
            "report_id": report_id,
            "filename": filename,
            "status": "document_processed",
            "language": lang,
            "analysis": analysis_payload
        })

    except Exception as error:
        logger.error(
            "Server processing error: %s: %s",
            type(error).__name__,
            str(error)
        )
        return jsonify({
            "error": "An error occurred while processing the medical report.",
            "message": "Unable to complete report analysis at this time."
        }), 500


# =====================================================================
# DATABASE REPORTS HISTORY ENDPOINTS
# =====================================================================

@app.route("/api/reports", methods=["GET"])
@require_auth
def list_reports():
    """Fetch previous reports for the authenticated user from PostgreSQL."""
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    reports = get_user_reports_from_db(user_id=user_id)
    return jsonify({"reports": reports})


@app.route("/api/reports/<report_id>", methods=["GET"])
@require_auth
def get_single_report(report_id):
    """Retrieve an individual report by ID, verifying user ownership."""
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    report = get_report_by_id(report_id=report_id, user_id=user_id)
    if not report:
        return jsonify({"error": "Report not found"}), 404
    return jsonify({"report": report})


# =====================================================================
# INTERACTIVE CHAT ENDPOINTS (Google Gemini API + Free Fallback)
# =====================================================================

@app.route("/api/chat", methods=["POST"])
@require_auth
def interactive_chat():
    """
    Interactive medical report discussion endpoint.
    Powered by Google Gemini API with a zero-cost intelligent fallback.
    Saves conversation turns to PostgreSQL.
    """
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()
    if not message:
        return jsonify({"error": "Message is required."}), 400

    report_id = data.get("report_id")
    language = data.get("language", "en")
    client_api_key = data.get("api_key") or request.headers.get("X-Gemini-API-Key")

    # Fetch report context if a specific report is active
    report_data = None
    if report_id:
        report_data = get_report_by_id(report_id=report_id, user_id=user_id)

    # Fetch recent conversation history for multi-turn context
    conversation_history = get_chat_history(user_id=user_id, report_id=report_id, limit=8)

    # Process chat response via Gemini or free rule-based engine
    chat_result = process_chat_message(
        user_id=user_id,
        message=message,
        report_data=report_data,
        language=language,
        conversation_history=conversation_history,
        api_key=client_api_key
    )

    # Save user message and AI response to PostgreSQL
    try:
        save_chat_message(
            user_id=user_id,
            role="user",
            content=message,
            report_id=report_id
        )
        save_chat_message(
            user_id=user_id,
            role="assistant",
            content=chat_result["reply"],
            report_id=report_id,
            sources=chat_result["sources"]
        )
    except Exception as db_chat_err:
        logger.error("Failed to persist chat messages to database: %s", db_chat_err)

    return jsonify({
        "reply": chat_result["reply"],
        "engine": chat_result["engine"],
        "sources": chat_result["sources"],
        "language": chat_result["language"],
        "report_id": report_id
    })


@app.route("/api/chat/history", methods=["GET"])
@require_auth
def fetch_chat_history():
    """Retrieve chat history for the authenticated user/report."""
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    report_id = request.args.get("report_id")
    messages = get_chat_history(user_id=user_id, report_id=report_id)
    return jsonify({"messages": messages})


@app.route("/api/chat/history", methods=["DELETE"])
@require_auth
def clear_user_chat():
    """Clear chat conversation history."""
    user_id = getattr(g, "user_id", None)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    report_id = request.args.get("report_id")
    success = clear_chat_history(user_id=user_id, report_id=report_id)
    return jsonify({"success": success})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=False,
    )
