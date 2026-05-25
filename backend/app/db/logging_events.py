"""
SQLAlchemy engine event hooks for database error logging.
"""

import logging

from sqlalchemy import event
from sqlalchemy.engine import Engine

logger = logging.getLogger("app.db.sqlalchemy")


def register_engine_logging(engine: Engine) -> None:
    """Log full tracebacks for every SQLAlchemy / DBAPI error."""

    @event.listens_for(engine, "handle_error")
    def _log_sqlalchemy_error(exception_context) -> None:
        exc = exception_context.original_exception
        statement = exception_context.statement
        logger.exception(
            "SQLAlchemy database error (statement=%r)",
            statement[:500] if statement and len(statement) > 500 else statement,
            exc_info=exc if isinstance(exc, BaseException) else True,
        )
