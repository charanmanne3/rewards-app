"""
Database engine and session factory.

get_db() is a FastAPI dependency that yields a session per request,
rolls back on exceptions, and ensures the session is closed afterward.
"""

import logging
from collections.abc import Generator
from urllib.parse import urlparse

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.db.logging_events import register_engine_logging

logger = logging.getLogger(__name__)


def _connect_args_for_url(database_url: str) -> dict:
    """psycopg2 SSL/connect options — required for Supabase from Render."""
    host = (urlparse(database_url).hostname or "").lower()
    if host in ("localhost", "127.0.0.1") or not host:
        return {"connect_timeout": 10}
    return {"sslmode": "require", "connect_timeout": 15}


def _log_engine_config(settings: Settings) -> None:
    parsed = urlparse(settings.database_url)
    host = parsed.hostname or "unknown"
    port = parsed.port or 5432
    logger.info(
        "Creating SQLAlchemy engine host=%s port=%s pool_pre_ping=%s pool_recycle=%s ssl=require",
        host,
        port,
        settings.db_pool_pre_ping,
        settings.db_pool_recycle_seconds,
    )
    if host.endswith(".supabase.co") and port == 5432:
        logger.warning(
            "DATABASE_URL uses Supabase direct host %s:%s — often unreachable from Render. "
            "Use the Session pooler URI from Supabase (host *.pooler.supabase.com, port 6543).",
            host,
            port,
        )


def _create_database_engine(settings: Settings) -> Engine:
    _log_engine_config(settings)
    try:
        eng = create_engine(
            settings.database_url,
            pool_pre_ping=settings.db_pool_pre_ping,
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            pool_recycle=settings.db_pool_recycle_seconds,
            connect_args=_connect_args_for_url(settings.database_url),
        )
        if settings.is_production:
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database engine connected successfully (production)")
        return eng
    except Exception:
        logger.exception(
            "Database engine startup failed (check DATABASE_URL, sslmode=require, "
            "and Supabase pooler host/port for Render)"
        )
        raise


_settings = get_settings()
engine = _create_database_engine(_settings)
register_engine_logging(engine)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        logger.exception("Database session rolled back due to request error")
        raise
    finally:
        db.close()
