"""
Database engine and session factory.

get_db() is a FastAPI dependency that yields a session per request,
rolls back on exceptions, and ensures the session is closed afterward.
"""

import logging
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.db.logging_events import register_engine_logging

logger = logging.getLogger(__name__)

_settings = get_settings()

engine = create_engine(
    _settings.database_url,
    pool_pre_ping=_settings.db_pool_pre_ping,
    pool_size=_settings.db_pool_size,
    max_overflow=_settings.db_max_overflow,
    pool_recycle=_settings.db_pool_recycle_seconds,
)

register_engine_logging(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


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
