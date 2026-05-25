"""
Schema-safe credit card queries for API routes.

Uses column introspection so queries work before/after migration 003 metadata
columns exist, and builds Pydantic responses while the session is still open.
"""

from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session, load_only

from app.models.credit_card import CreditCard
from app.schemas.credit_card import CreditCardRead
from app.services.card_serialization import card_load_only_attrs

logger = logging.getLogger(__name__)


def fetch_cards_read(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
) -> list[CreditCardRead]:
    """Load credit cards and return API schemas (safe for current DB schema)."""
    load_attrs = card_load_only_attrs(db)
    column_names = [getattr(a, "key", str(a)) for a in load_attrs]
    logger.info("GET /cards query columns=%s skip=%s limit=%s", column_names, skip, limit)

    try:
        stmt = (
            select(CreditCard)
            .options(load_only(*load_attrs))
            .order_by(CreditCard.card_name)
            .offset(skip)
            .limit(limit)
        )
        cards = list(db.scalars(stmt).all())
        result = [CreditCardRead.model_validate(c) for c in cards]
        logger.info("GET /cards loaded %d card(s)", len(result))
        return result
    except Exception:
        logger.exception(
            "GET /cards query failed (columns=%s skip=%s limit=%s)",
            column_names,
            skip,
            limit,
        )
        raise
