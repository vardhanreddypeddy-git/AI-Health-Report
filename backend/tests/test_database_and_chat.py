"""
Tests for PostgreSQL database integration and interactive chat endpoint.
"""

import os
import sys
import pytest
from unittest.mock import patch, MagicMock

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app
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


@pytest.fixture
def client():
    app.config["TESTING"] = True
    init_db()
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_auth():
    """Mock Clerk authentication decorator context."""
    mock_state = MagicMock()
    mock_state.is_authenticated = True
    mock_state.payload = {"sub": "user_test_pg_123", "sid": "sess_123"}
    with patch("auth.authenticate_request", return_value=mock_state):
        yield "user_test_pg_123"


def test_database_report_and_chat_crud():
    """Test saving reports and messages into PostgreSQL/database."""
    user_id = "user_test_pg_123"
    analysis_payload = {
        "report_type": "laboratory",
        "impression": "Normal blood panel",
        "biomarkers": [{"name": "Hemoglobin", "value": 14.2, "unit": "g/dL", "status": "normal"}]
    }

    # 1. Save report
    report = save_report_to_db(user_id, "cbc_report.pdf", "laboratory", "en", analysis_payload)
    assert report is not None
    assert report["user_id"] == user_id
    assert report["filename"] == "cbc_report.pdf"
    report_id = report["id"]

    # 2. Get report by ID
    fetched = get_report_by_id(report_id, user_id)
    assert fetched is not None
    assert fetched["id"] == report_id

    # 3. List reports
    user_reports = get_user_reports_from_db(user_id)
    assert len(user_reports) >= 1
    assert any(r["id"] == report_id for r in user_reports)

    # 4. Save chat message
    msg_u = save_chat_message(user_id, "user", "Is my hemoglobin good?", report_id=report_id)
    assert msg_u is not None
    assert msg_u["content"] == "Is my hemoglobin good?"

    msg_a = save_chat_message(user_id, "assistant", "Yes, 14.2 is normal.", report_id=report_id, sources=[{"name": "Hemoglobin"}])
    assert msg_a is not None
    assert msg_a["sources"] == [{"name": "Hemoglobin"}]

    # 5. Fetch history
    history = get_chat_history(user_id, report_id=report_id)
    assert len(history) >= 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"

    # 6. Clear history
    assert clear_chat_history(user_id, report_id=report_id) is True
    history_after = get_chat_history(user_id, report_id=report_id)
    assert len(history_after) == 0


def test_chat_service_free_engine_fallback():
    """Test that process_chat_message works with zero cost even without Gemini key."""
    sample_report = {
        "report_type": "laboratory",
        "filename": "blood_panel.pdf",
        "analysis": {
            "impression": "Elevated blood sugar detected",
            "concern_level": {"label": "Attention", "description": "High glucose"},
            "biomarkers": [
                {"name": "Fasting Blood Glucose", "value": 145, "unit": "mg/dL", "reference_range": "70-99", "status": "high", "status_explanation": "Elevated fasting blood sugar"}
            ],
            "doctor_questions": ["What is my recommended HbA1c target?"]
        }
    }

    # Query 1: Asking about abnormal/high values
    res1 = process_chat_message("user_123", "Which tests are high or abnormal?", report_data=sample_report, language="en")
    assert "Fasting Blood Glucose" in res1["reply"]
    assert "High" in res1["reply"]
    assert len(res1["sources"]) > 0

    # Query 2: Asking for questions to ask doctor
    res2 = process_chat_message("user_123", "What questions should I ask my doctor?", report_data=sample_report, language="en")
    assert "HbA1c" in res2["reply"] or "Questions" in res2["reply"]

    # Query 3: Asking about diet / lifestyle
    res3 = process_chat_message("user_123", "What should I eat?", report_data=sample_report, language="en")
    assert "Nutrition" in res3["reply"] or "diet" in res3["reply"].lower() or "Health" in res3["reply"]


def test_api_chat_endpoint(client, mock_auth):
    """Test POST /api/chat protected endpoint."""
    headers = {"Authorization": "Bearer mock_valid_clerk_token"}

    # 1. Missing message returns 400
    res_err = client.post("/api/chat", json={}, headers=headers)
    assert res_err.status_code == 400

    # 2. Valid chat message
    res = client.post(
        "/api/chat",
        json={"message": "What does Hemoglobin measure?", "language": "en"},
        headers=headers
    )
    assert res.status_code == 200
    data = res.get_json()
    assert "reply" in data
    assert len(data["reply"]) > 0
    assert "engine" in data

    # 3. Fetch chat history
    res_hist = client.get("/api/chat/history", headers=headers)
    assert res_hist.status_code == 200
    hist_data = res_hist.get_json()
    assert "messages" in hist_data
    assert len(hist_data["messages"]) >= 2  # user + assistant

    # 4. Clear chat history
    res_del = client.delete("/api/chat/history", headers=headers)
    assert res_del.status_code == 200
    assert res_del.get_json().get("success") is True


def test_api_reports_list_endpoint(client, mock_auth):
    """Test GET /api/reports endpoint."""
    headers = {"Authorization": "Bearer mock_valid_clerk_token"}
    res = client.get("/api/reports", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert "reports" in data
