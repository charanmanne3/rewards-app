from sqlalchemy import select
from sqlalchemy.orm import Session, load_only

from app.models.credit_card import CreditCard
from app.services.card_serialization import card_load_only_attrs


def get_cards(db: Session, skip: int = 0, limit: int = 100) -> list[CreditCard]:
    """Return ORM credit cards (schema-safe column set)."""
    load_attrs = card_load_only_attrs(db)
    stmt = (
        select(CreditCard)
        .options(load_only(*load_attrs))
        .order_by(CreditCard.card_name)
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
