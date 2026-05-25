"""
Centralized logging configuration.

Call setup_logging() once at application startup so all modules
share the same log format and level.
"""

import json
import logging
import sys
import traceback
from datetime import datetime, timezone

from app.core.config import get_settings


class FlushingStreamHandler(logging.StreamHandler):
    """Emit log records and flush stdout immediately (Render production)."""

    def emit(self, record: logging.LogRecord) -> None:
        super().emit(record)
        self.flush()


class JsonFormatter(logging.Formatter):
    """JSON logs for Render; includes full traceback on errors."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            exc_type = record.exc_info[0]
            payload["exc_type"] = exc_type.__name__ if exc_type else None
            payload["exception"] = self.formatException(record.exc_info)
            payload["traceback"] = "".join(
                traceback.format_exception(*record.exc_info)
            )
        return json.dumps(payload, default=str)


def setup_logging() -> None:
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(level)

    handler = FlushingStreamHandler(sys.stdout)
    if settings.log_format.lower() == "json" or settings.is_production:
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
    root.addHandler(handler)

    # App + database loggers
    logging.getLogger("app").setLevel(level)
    logging.getLogger("app.db.sqlalchemy").setLevel(logging.ERROR)

    if settings.is_production:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    elif not settings.debug:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    # Route uvicorn error logs through the same handler (full tracebacks on Render)
    for name in ("uvicorn", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers = []
        uvicorn_logger.propagate = True
