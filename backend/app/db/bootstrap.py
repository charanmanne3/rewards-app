"""
Database bootstrap for production (Render) and local runs.

Runs Alembic migrations and seeds reference data when tables are empty.
Uses DATABASE_URL from app settings (environment variables).
"""

import logging
from pathlib import Path

from alembic import command
from alembic.config import Config

from app.core.config import get_settings
from app.db.seed_data import seed_if_empty

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_ALEMBIC_INI = _BACKEND_ROOT / "alembic.ini"


def run_migrations() -> None:
    """Apply all pending Alembic migrations (upgrade head)."""
    settings = get_settings()
    if not settings.database_url:
        raise ValueError("DATABASE_URL is required for migrations")

    if not _ALEMBIC_INI.is_file():
        raise FileNotFoundError(f"Alembic config not found: {_ALEMBIC_INI}")

    logger.info("Running Alembic migrations (upgrade head)")
    cfg = Config(str(_ALEMBIC_INI))
    command.upgrade(cfg, "head")
    logger.info("Alembic migrations complete")


def bootstrap_database() -> None:
    """Run migrations then seed initial data if the database is empty."""
    run_migrations()
    seeded = seed_if_empty()
    if seeded:
        logger.info("Initial database seed completed")
    else:
        logger.info("Database seed skipped (existing data)")

