"""
Interactive Chat Service powered by Google Gemini API (with zero-cost clinical fallback).
Enables patients to have a conversational discussion about their medical lab results and imaging scans.
"""

import os
import json
import logging
import re
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

LANGUAGE_MAP = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
}

# Fallback free model preferences
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]


def _format_report_context(report_data: Optional[Dict[str, Any]]) -> str:
    """Format report biomarkers and findings into structured context for the LLM."""
    if not report_data:
        return "No specific medical report is currently attached. Provide general educational health information."

    report_type = report_data.get("report_type", "laboratory")
    filename = report_data.get("filename", "medical_report.pdf")
    analysis = report_data.get("analysis", {}) or {}

    lines = [
        f"ATTACHED REPORT: {filename} (Type: {report_type.upper()})",
    ]

    impression = analysis.get("impression") or report_data.get("impression")
    if impression:
        lines.append(f"CLINICAL IMPRESSION: {impression}")

    concern = analysis.get("concern_level") or {}
    if concern.get("label"):
        lines.append(f"TRIAGE ASSESSMENT: {concern.get('label')} - {concern.get('description')}")

    # Laboratory biomarkers
    biomarkers = analysis.get("biomarkers") or report_data.get("biomarkers") or []
    if biomarkers:
        lines.append("\nEXTRACTED BIOMARKERS:")
        for b in biomarkers:
            name = b.get("name", "Unknown")
            val = b.get("value")
            unit = b.get("unit", "")
            ref = b.get("reference_range", "")
            status = b.get("status", "unknown").upper()
            expl = b.get("status_explanation", "")
            lines.append(f"- {name}: {val} {unit} [Range: {ref}] -> Status: {status} ({expl})")

    # Imaging findings
    findings = analysis.get("findings") or []
    if findings:
        lines.append("\nIMAGING FINDINGS:")
        for f in findings:
            organ = f.get("organ", "Region")
            obs = f.get("observation", "")
            lines.append(f"- {organ}: {obs}")

    # Discovered patterns
    patterns = analysis.get("patterns") or []
    if patterns:
        lines.append("\nDETECTED CLINICAL PATTERNS:")
        for p in patterns:
            p_name = p.get("pattern", "")
            p_desc = p.get("explanation", "")
            lines.append(f"- {p_name}: {p_desc}")

    # Suggested doctor questions
    questions = analysis.get("doctor_questions") or []
    if questions:
        lines.append("\nRECOMMENDED PHYSICIAN QUESTIONS:")
        for q in questions[:4]:
            lines.append(f"- {q}")

    return "\n".join(lines)


def _generate_gemini_reply(
    prompt: str,
    context: str,
    conversation_history: List[Dict[str, str]],
    target_lang_name: str,
    api_key: str
) -> Optional[str]:
    """Call Google Gemini API using the official google-genai SDK."""
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        system_instruction = (
            "You are an empathetic, clinical AI Health Assistant. Your goal is to help "
            "patients understand their medical reports in clear, reassuring, and accessible language.\n"
            "Key Clinical Safety Rules:\n"
            "1. Explain medical jargon in plain language without unnecessary alarmism.\n"
            "2. If the user asks about abnormal values, clearly point out the measured number vs normal range.\n"
            "3. Provide lifestyle, nutritional, and general wellness context when appropriate.\n"
            "4. Suggest specific questions the user can ask their doctor during their consultation.\n"
            "5. Always emphasize that your guidance is educational and does not replace professional medical diagnosis.\n"
            f"6. Respond fluently and naturally in {target_lang_name}.\n\n"
            f"CURRENT PATIENT REPORT CONTEXT:\n{context}"
        )

        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        # Build contents from conversation history
        contents = []
        for msg in conversation_history[-6:]:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.get("content", ""))]
            ))

        # Add current user prompt
        contents.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        ))

        # Attempt with primary model, fall back if needed
        for m in [model_name, "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3,
                        max_output_tokens=1000,
                    )
                )
                if response.text and response.text.strip():
                    return response.text.strip()
            except Exception as m_err:
                logger.warning("Gemini model %s call failed: %s; trying next model", m, m_err)
                continue

        return None
    except Exception as err:
        logger.error("Gemini API invocation error: %s", err)
        return None


def _generate_groq_reply(
    prompt: str,
    context: str,
    conversation_history: List[Dict[str, str]],
    target_lang_name: str,
    api_key: str
) -> Optional[str]:
    """Call Groq's OpenAI-compatible chat completions API using the stdlib."""
    system_instruction = (
        "You are an empathetic, clinical AI Health Assistant. Explain medical reports clearly, "
        "avoid unnecessary alarm, suggest questions for a doctor, and state that guidance is "
        f"educational, not a diagnosis. Respond in {target_lang_name}.\n\n"
        f"CURRENT PATIENT REPORT CONTEXT:\n{context}"
    )
    messages = [{"role": "system", "content": system_instruction}]
    for msg in conversation_history[-6:]:
        role = "user" if msg.get("role") == "user" else "assistant"
        messages.append({"role": role, "content": msg.get("content", "")})
    messages.append({"role": "user", "content": prompt})
    payload = json.dumps({
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1000,
    }).encode("utf-8")
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
        content = result["choices"][0]["message"]["content"]
        return content.strip() if content and content.strip() else None
    except Exception as err:
        logger.warning("Groq API invocation failed: %s", err)
        return None
def _generate_free_rule_reply(
    prompt: str,
    report_data: Optional[Dict[str, Any]],
    language: str
) -> str:
    """
    Intelligent zero-cost rule-based medical assistant fallback.
    Answers patient questions using local clinical extraction & knowledge base.
    """
    query = prompt.lower().strip()
    analysis = (report_data.get("analysis") if report_data else {}) or {}
    biomarkers = analysis.get("biomarkers") or (report_data.get("biomarkers") if report_data else []) or []
    impression = analysis.get("impression") or (report_data.get("impression") if report_data else "")
    concern = analysis.get("concern_level") or {}
    patterns = analysis.get("patterns") or []
    doctor_questions = analysis.get("doctor_questions") or []

    # 1. Abnormal / High / Low tests question
    if any(k in query for k in ["abnormal", "high", "low", "out of range", "concern", "problem", "issue", "results"]):
        abnormals = [b for b in biomarkers if b.get("status") in ["high", "low"]]
        if abnormals:
            lines = ["Here are the parameters from your report that are outside the typical reference range:\n"]
            for b in abnormals:
                sym = "🔺 High" if b.get("status") == "high" else "🔻 Low"
                lines.append(f"- **{b.get('name')}**: **{b.get('value')} {b.get('unit')}** ({sym})")
                lines.append(f"  *Typical range:* {b.get('reference_range') or 'Not specified'}")
                if b.get("status_explanation"):
                    lines.append(f"  *Note:* {b.get('status_explanation')}")
            lines.append("\n💡 *Recommendation:* Discuss these values with your healthcare provider to understand their clinical significance in your overall context.")
            return "\n".join(lines)
        elif biomarkers:
            return "✅ **Good news!** All detected biomarkers in your report appear to be within their standard reference ranges. Continue maintaining a balanced lifestyle and discuss these findings with your doctor during your regular check-up."
        else:
            return "No specific numeric biomarker irregularities were detected in the uploaded document. If this is an imaging scan, please check the clinical impression section."

    # 2. Impression / Summary question
    if any(k in query for k in ["impression", "summary", "diagnos", "what does it mean", "explain my report", "overall"]):
        lines = []
        if impression:
            lines.append(f"### 📋 Clinical Impression Summary\n**{impression}**\n")
        if concern.get("label"):
            lines.append(f"**Triage Level:** {concern.get('label')} — {concern.get('description')}\n")
        if patterns:
            lines.append("### 🧬 Observed Clinical Patterns:")
            for p in patterns:
                lines.append(f"- **{p.get('pattern')}**: {p.get('explanation')}")
        if not lines:
            lines.append("Your report has been processed. Please refer to the biomarker breakdown table to inspect individual lab values and organ metrics.")
        return "\n".join(lines)

    # 3. Doctor questions query
    if any(k in query for k in ["doctor", "ask", "question", "appointment", "physician", "consult"]):
        if doctor_questions:
            lines = ["### 🩺 Suggested Questions for Your Doctor:\nHere are targeted questions tailored to your report:"]
            for i, q in enumerate(doctor_questions, 1):
                lines.append(f"{i}. {q}")
            lines.append("\n*Tip: Write these questions down or take your report summary with you to your visit.*")
            return "\n".join(lines)
        return "1. Do my test values require any follow-up investigation or repeat testing?\n2. Are there specific dietary or lifestyle modifications you recommend based on these findings?\n3. Should I be on any supportive medication or supplements?"

    # 4. Check for specific biomarker queries (e.g., Hemoglobin, Glucose, WBC, Platelets, Creatinine)
    for b in biomarkers:
        name_lower = b.get("name", "").lower()
        if name_lower and (name_lower in query or any(part in query for part in name_lower.split() if len(part) > 3)):
            status_text = b.get("status", "normal").capitalize()
            return (
                f"### 🧪 **{b.get('name')}**\n\n"
                f"- **Your Result:** `{b.get('value')} {b.get('unit')}`\n"
                f"- **Reference Range:** `{b.get('reference_range') or 'Standard laboratory range'}`\n"
                f"- **Evaluation:** **{status_text}**\n\n"
                f"**Clinical Context:** {b.get('status_explanation') or 'This parameter was measured as part of your panel.'}\n\n"
                f"*Consult your healthcare provider if you experience symptoms related to this test.*"
            )

    # 5. Diet / Nutrition / Lifestyle query
    if any(k in query for k in ["diet", "food", "eat", "lifestyle", "exercise", "nutrition", "prevent"]):
        return (
            "### 🥗 General Health & Wellness Guidelines:\n\n"
            "- **Hydration:** Ensure adequate water intake throughout the day (2–3 liters unless clinically restricted).\n"
            "- **Balanced Nutrition:** Focus on whole grains, fresh vegetables, lean proteins, and healthy fats while limiting ultra-processed sugars and sodium.\n"
            "- **Physical Activity:** Aim for at least 150 minutes of moderate aerobic exercise (e.g. brisk walking) weekly.\n"
            "- **Sleep & Recovery:** Maintain 7–8 hours of consistent, restorative sleep nightly.\n\n"
            "⚠️ *Always verify specific dietary changes with your physician or clinical dietitian, especially if you have metabolic or renal conditions.*"
        )

    # 6. Default helpful response
    return (
        "I am here to help you understand your medical reports! You can ask me:\n\n"
        "- *'Which values are abnormal or high?'*\n"
        "- *'What does my clinical impression mean?'*\n"
        "- *'Tell me about my Hemoglobin / Glucose / Platelets'* \n"
        "- *'What questions should I ask my doctor?'*\n"
        "- *'What lifestyle or dietary habits should I follow?'*\n\n"
        "Feel free to ask any question about your health results."
    )


def process_chat_message(
    user_id: str,
    message: str,
    report_data: Optional[Dict[str, Any]] = None,
    language: str = "en",
    conversation_history: Optional[List[Dict[str, str]]] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main chat orchestration function:
    1. Tries Groq if GROQ_API_KEY is configured, then Gemini if configured or passed by client.
    2. Falls back seamlessly to the free rule-based engine if key is absent or fails.
    3. Identifies relevant source biomarkers.
    """
    target_lang_name = LANGUAGE_MAP.get(language, "English")
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    resolved_api_key = (api_key or os.getenv("GEMINI_API_KEY", "")).strip()
    history = conversation_history or []

    reply_text = None
    engine_used = "free_rule_engine"

    if groq_api_key:
        context = _format_report_context(report_data)
        logger.info("Attempting interactive chat via Groq API...")
        reply_text = _generate_groq_reply(
            prompt=message,
            context=context,
            conversation_history=history,
            target_lang_name=target_lang_name,
            api_key=groq_api_key,
        )
        if reply_text:
            engine_used = "groq_api"

    if not reply_text and resolved_api_key:
        context = _format_report_context(report_data)
        logger.info("Attempting interactive chat via Google Gemini API...")
        reply_text = _generate_gemini_reply(
            prompt=message,
            context=context,
            conversation_history=history,
            target_lang_name=target_lang_name,
            api_key=resolved_api_key
        )
        if reply_text:
            engine_used = "gemini_api"

    if not reply_text:
        logger.info("Generating reply via free clinical knowledge engine...")
        reply_text = _generate_free_rule_reply(
            prompt=message,
            report_data=report_data,
            language=language
        )
        engine_used = "free_rule_engine"

    # Identify relevant sources if question relates to specific biomarkers
    sources = []
    if report_data:
        analysis = report_data.get("analysis", {}) or {}
        biomarkers = analysis.get("biomarkers") or []
        for b in biomarkers:
            b_name = b.get("name", "")
            if b_name and b_name.lower() in (message.lower() + " " + reply_text.lower()):
                sources.append({
                    "name": b_name,
                    "value": b.get("value"),
                    "unit": b.get("unit"),
                    "status": b.get("status")
                })

    return {
        "reply": reply_text,
        "engine": engine_used,
        "sources": sources[:5],
        "language": language
    }
