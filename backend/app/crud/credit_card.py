from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.credit_card import CreditCard


def get_cards(db: Session, skip: int = 0, limit: int = 100) -> list[CreditCard]:
    stmt = select(CreditCard).order_by(CreditCard.card_name).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())
