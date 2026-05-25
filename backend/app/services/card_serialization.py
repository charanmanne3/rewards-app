"""
Safe extraction of credit card metadata for API responses.

Handles missing DB columns (pre-migration) and NULL values without raising.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from sqlalchemy import inspect

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

    from app.models.credit_card import CreditCard

logger = logging.getLogger(__name__)

OPTIONAL_CARD_COLUMNS = ("annual_fee", "signup_bonus", "network")


def get_credit_card_column_names(session: Session) -> set[str]:
    bind = session.get_bind()
    url = str(bind.url)
    cache_key = f"{url}:credit_cards"

    if not hasattr(get_credit_card_column_names, "_cache"):
        get_credit_card_column_names._cache = {}  # type: ignore[attr-defined]

    cache: dict = get_credit_card_column_names._cache  # type: ignore[attr-defined]
    if cache_key not in cache:
        try:
            insp = inspect(bind)
            cache[cache_key] = {c["name"] for c in insp.get_columns("credit_cards")}
        except Exception:
            logger.exception("Could not inspect credit_cards columns")
            cache[cache_key] = {"id", "card_name", "issuer"}

    return cache[cache_key]


def card_load_only_attrs(session: Session) -> list[Any]:
    """SQLAlchemy load_only attrs that exist in the current schema."""
    from app.models.credit_card import CreditCard

    cols = get_credit_card_column_names(session)
    attrs = [CreditCard.id, CreditCard.card_name, CreditCard.issuer]
    for name in OPTIONAL_CARD_COLUMNS:
        if name in cols:
            attrs.append(getattr(CreditCard, name))
    return attrs


def safe_annual_fee(card: CreditCard | None) -> float:
    if card is None:
        return 0.0
    try:
        value = getattr(card, "annual_fee", None)
        return float(value) if value is not None else 0.0
    except (TypeError, ValueError):
        return 0.0


def safe_signup_bonus(card: CreditCard | None) -> str | None:
    if card is None:
        return None
    value = getattr(card, "signup_bonus", None)
    return str(value) if value is not None else None


def safe_network(card: CreditCard | None) -> str | None:
    if card is None:
        return None
    value = getattr(card, "network", None)
    return str(value) if value is not None else None
