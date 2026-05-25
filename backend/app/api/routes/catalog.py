"""Public catalog: promotional offers."""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import reward as reward_crud
from app.models.enums import RewardType
from app.schemas.catalog import PromotionalOfferRead

logger = logging.getLogger(__name__)

router = APIRouter(tags=["catalog"])


@router.get("/offers/promotional", response_model=list[PromotionalOfferRead])
def list_promotional_offers(db: Session = Depends(get_db)) -> list[PromotionalOfferRead]:
    """Active promotional offers with expiration dates."""
    rewards = reward_crud.get_eligible_rewards(db, reward_type=RewardType.PROMOTIONAL.value)
    offers: list[PromotionalOfferRead] = []
    for r in rewards:
        if not r.store or not r.card:
            continue
        offers.append(
            PromotionalOfferRead(
                id=r.id,
                store_name=r.store.name,
                store_category=r.store.category,
                card_name=r.card.card_name,
                issuer=r.card.issuer,
                cashback_percent=r.cashback_percent,
                start_date=r.start_date,
                end_date=r.end_date,
            )
        )
    offers.sort(key=lambda o: (o.end_date or o.start_date, -o.cashback_percent), reverse=False)
    logger.debug("Returning %d promotional offers", len(offers))
    return offers
