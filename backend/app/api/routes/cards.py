import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import credit_card as card_crud
from app.crud import reward as reward_crud
from app.models.enums import RewardType
from app.schemas.catalog import CardRewardSummary, CreditCardDetailRead
from app.schemas.credit_card import CreditCardRead
from app.schemas.store_cards import StoreCardsResponse
from app.services.store_cards import get_store_cards

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cards", tags=["cards"])


@router.get("", response_model=list[CreditCardRead])
def list_cards(db: Session = Depends(get_db)) -> list[CreditCardRead]:
    """Return all credit cards."""
    return card_crud.get_cards(db)


@router.get("/details", response_model=list[CreditCardDetailRead])
def list_cards_with_rewards(db: Session = Depends(get_db)) -> list[CreditCardDetailRead]:
    """All credit cards with their active, eligible reward mappings."""
    cards = card_crud.get_cards(db)
    eligible = reward_crud.get_eligible_rewards(db)

    by_card: dict[int, list[CardRewardSummary]] = {}
    for r in eligible:
        if not r.store or not r.card:
            continue
        by_card.setdefault(r.card_id, []).append(
            CardRewardSummary(
                store_name=r.store.name,
                store_category=r.store.category,
                cashback_percent=r.cashback_percent,
                reward_type=r.reward_type,
            )
        )

    return [
        CreditCardDetailRead(
            id=c.id,
            card_name=c.card_name,
            issuer=c.issuer,
            rewards=sorted(by_card.get(c.id, []), key=lambda x: x.cashback_percent, reverse=True),
        )
        for c in cards
    ]


@router.get("/{store_name}", response_model=StoreCardsResponse)
def cards_for_store(
    store_name: str,
    db: Session = Depends(get_db),
) -> StoreCardsResponse:
    """
    All matching credit cards for a store, sorted by cashback descending.

    Returns cards=[] (never 500) when store is unknown or no active rewards exist.
    """
    try:
        return get_store_cards(db, store_name)
    except Exception:
        logger.exception("Unexpected error in cards_for_store store_name=%s", store_name)
        from app.services.reward_eligibility import utc_today

        return StoreCardsResponse(
            store_name=store_name,
            store_category="",
            as_of_date=utc_today(),
            cards=[],
        )
