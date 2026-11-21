"""
Database layer supporting PostgreSQL (and fallback SQLite for local dev) using SQLAlchemy.
Manages medical reports history and interactive chat conversation sessions.
"""

import os
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    Index
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, scoped_session

logger = logging.getLogger(__name__)

Base = declarative_base()


class ReportRecord(Base):
    """
    Persisted medical report extraction and clinical analysis.
    """
    __tablename__ = "medical_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(128), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False, default="laboratory")
    language = Column(String(20), nullable=False, default="en")
    status = Column(String(50), nullable=False, default="document_processed")
    biomarkers = Column(JSON, nullable=True, default=list)
    analysis = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationship to associated chat messages
    messages = relationship("ChatMessageRecord", back_populates="report", cascade="all, delete-orphan", order_by="ChatMessageRecord.created_at")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "report_type": self.report_type,
            "language": self.language,
            "status": self.status,
            "biomarkers": self.biomarkers or [],
            "analysis": self.analysis or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ChatMessageRecord(Base):
    """
    Persisted interactive chat message for Gemini-assisted medical discussion.
    """
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(128), index=True, nullable=False)
    report_id = Column(String(36), ForeignKey("medical_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    role = Column(String(20), nullable=False)  # "user" | "assistant" | "system"
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    report = relationship("ReportRecord", back_populates="messages")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "report_id": self.report_id,
            "role": self.role,
            "content": self.content,
            "sources": self.sources or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def get_database_url() -> str:
    """
    Retrieve and format the database URL.
    Prefers PostgreSQL connection string from DATABASE_URL or POSTGRES_URL.
    Converts legacy 'postgres://' URI schemes to 'postgresql://'.
    Falls back to a local SQLite database for zero-config local development.
    """
    raw_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL") or ""
    raw_url = raw_url.strip()

    if raw_url:
        # Heroku/Render legacy postgres URI fix
        if raw_url.startswith("postgres://"):
            raw_url = "postgresql://" + raw_url[len("postgres://"):]
        return raw_url

    # Check for individual PG components
    pg_user = os.getenv("PGUSER") or os.getenv("POSTGRES_USER")
    pg_password = os.getenv("PGPASSWORD") or os.getenv("POSTGRES_PASSWORD")
    pg_host = os.getenv("PGHOST") or os.getenv("POSTGRES_HOST") or "localhost"
    pg_port = os.getenv("PGPORT") or os.getenv("POSTGRES_PORT") or "5432"
    pg_db = os.getenv("PGDATABASE") or os.getenv("POSTGRES_DB")

    if pg_user and pg_db:
        auth = f"{pg_user}:{pg_password}@" if pg_password else f"{pg_user}@"
        return f"postgresql://{auth}{pg_host}:{pg_port}/{pg_db}"

    # Default fallback: local SQLite DB
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sqlite_path = os.path.join(base_dir, "health_interpreter.db")
    return f"sqlite:///{sqlite_path}"


engine = None
SessionLocal = None


def init_db():
    """
    Initialize database engine and create tables.
    Handles connection errors gracefully.
    """
    global engine, SessionLocal
    db_url = get_database_url()
    is_postgres = db_url.startswith("postgresql")

    logger.info("Initializing database: dialect=%s", "PostgreSQL" if is_postgres else "SQLite")

    engine_args = {}
    if is_postgres:
        engine_args.update({
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "pool_size": 10,
            "max_overflow": 20
        })
    else:
        # SQLite needs check_same_thread=False for multi-threaded Flask apps
        engine_args.update({
            "connect_args": {"check_same_thread": False}
        })

    try:
        engine = create_engine(db_url, **engine_args)
        Base.metadata.create_all(bind=engine)
        SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
        logger.info("Database initialized successfully.")
        return True
    except Exception as err:
        logger.error("Failed to connect to database (%s): %s", db_url.split("@")[-1], err)
        if is_postgres:
            # Fall back to SQLite so server continues running if local Postgres is not yet booted
            logger.warning("Attempting fallback to local SQLite database...")
            base_dir = os.path.dirname(os.path.abspath(__file__))
            fallback_url = f"sqlite:///{os.path.join(base_dir, 'health_interpreter_fallback.db')}"
            try:
                engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
                Base.metadata.create_all(bind=engine)
                SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
                logger.info("Fallback SQLite database initialized successfully.")
                return True
            except Exception as fb_err:
                logger.error("Fallback SQLite also failed: %s", fb_err)
                return False
        return False


def get_db_session():
    """Context manager or session getter."""
    if SessionLocal is None:
        init_db()
    return SessionLocal()


def save_report_to_db(user_id: str, filename: str, report_type: str, language: str, analysis: dict) -> Optional[dict]:
    """
    Save an analyzed report to the database.
    """
    session = get_db_session()
    try:
        record = ReportRecord(
            user_id=user_id,
            filename=filename,
            report_type=report_type,
            language=language,
            status="document_processed",
            biomarkers=analysis.get("biomarkers", []),
            analysis=analysis
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        logger.info("Saved report to database: report_id=%s, user_id=%s", record.id, user_id)
        return record.to_dict()
    except Exception as err:
        session.rollback()
        logger.error("Error saving report to database: %s", err)
        return None
    finally:
        session.close()


def get_user_reports_from_db(user_id: str, limit: int = 30) -> List[dict]:
    """
    Fetch reports for a given user ordered newest first.
    """
    session = get_db_session()
    try:
        records = (
            session.query(ReportRecord)
            .filter(ReportRecord.user_id == user_id)
            .order_by(ReportRecord.created_at.desc())
            .limit(limit)
            .all()
        )
        return [r.to_dict() for r in records]
    except Exception as err:
        logger.error("Error fetching user reports: %s", err)
        return []
    finally:
        session.close()


def get_report_by_id(report_id: str, user_id: str) -> Optional[dict]:
    """
    Fetch a single report verifying ownership by user_id.
    """
    session = get_db_session()
    try:
        record = (
            session.query(ReportRecord)
            .filter(ReportRecord.id == report_id, ReportRecord.user_id == user_id)
            .first()
        )
        return record.to_dict() if record else None
    except Exception as err:
        logger.error("Error fetching report by ID: %s", err)
        return None
    finally:
        session.close()


def save_chat_message(user_id: str, role: str, content: str, report_id: Optional[str] = None, sources: Optional[list] = None) -> Optional[dict]:
    """
    Save an interactive chat message (user or assistant) to PostgreSQL.
    """
    session = get_db_session()
    try:
        msg = ChatMessageRecord(
            user_id=user_id,
            report_id=report_id,
            role=role,
            content=content,
            sources=sources or []
        )
        session.add(msg)
        session.commit()
        session.refresh(msg)
        return msg.to_dict()
    except Exception as err:
        session.rollback()
        logger.error("Error saving chat message to database: %s", err)
        return None
    finally:
        session.close()


def get_chat_history(user_id: str, report_id: Optional[str] = None, limit: int = 50) -> List[dict]:
    """
    Fetch chat conversation history for a user (optionally scoped to a specific report).
    """
    session = get_db_session()
    try:
        query = session.query(ChatMessageRecord).filter(ChatMessageRecord.user_id == user_id)
        if report_id:
            query = query.filter(ChatMessageRecord.report_id == report_id)
        records = query.order_by(ChatMessageRecord.created_at.asc()).limit(limit).all()
        return [r.to_dict() for r in records]
    except Exception as err:
        logger.error("Error fetching chat history: %s", err)
        return []
    finally:
        session.close()


def clear_chat_history(user_id: str, report_id: Optional[str] = None) -> bool:
    """
    Delete chat messages for a user/report.
    """
    session = get_db_session()
    try:
        query = session.query(ChatMessageRecord).filter(ChatMessageRecord.user_id == user_id)
        if report_id:
            query = query.filter(ChatMessageRecord.report_id == report_id)
        query.delete(synchronize_session=False)
        session.commit()
        return True
    except Exception as err:
        session.rollback()
        logger.error("Error clearing chat history: %s", err)
        return False
    finally:
        session.close()
