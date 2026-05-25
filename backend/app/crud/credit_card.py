import logging
import sys
import traceback

from sqlalchemy import select
from sqlalchemy.orm import Session, load_only

from app.models.credit_card import CreditCard
from app.services.card_serialization import card_load_only_attrs

logger = logging.getLogger(__name__)


def _flush_logs() -> None:
    for handler in logging.root.handlers:
        flush = getattr(handler, "flush", None)
        if callable(flush):
            handler.flush()
    sys.stdout.flush()
    sys.stderr.flush()


def _log_db_exception(context: str, exc: Exception) -> None:
    logger.error(
        "%s | exc_type=%s | message=%s | traceback=%s",
        context,
        type(exc).__name__,
        exc,
        traceback.format_exc(),
    )
    _flush_logs()


def get_cards(db: Session, skip: int = 0, limit: int = 100) -> list[CreditCard]:
    """Return ORM credit cards (schema-safe column set)."""
    logger.info("[DEBUG] get_cards: start skip=%s limit=%s", skip, limit)
    try:
        logger.info("[DEBUG] get_cards: before card_load_only_attrs")
        load_attrs = card_load_only_attrs(db)
        column_names = [getattr(a, "key", str(a)) for a in load_attrs]
        logger.info(
            "[DEBUG] get_cards: after card_load_only_attrs columns=%s",
            column_names,
        )

        stmt = (
            select(CreditCard)
            .options(load_only(*load_attrs))
            .order_by(CreditCard.card_name)
            .offset(skip)
            .limit(limit)
        )
        logger.info("[DEBUG] get_cards: before db.scalars query")
        cards = list(db.scalars(stmt).all())
        logger.info(
            "[DEBUG] get_cards: after db.scalars query row_count=%s",
            len(cards),
        )
        _flush_logs()
        return cards
    except Exception as exc:
        _log_db_exception(
            f"get_cards failed (skip={skip}, limit={limit})",
            exc,
        )
        raise
