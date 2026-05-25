"""All matching credit cards for a store, sorted by cashback."""

import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, load_only

from app.crud import store as store_crud
from app.models.reward import Reward
from app.schemas.store_cards import StoreCardMatch, StoreCardsResponse
from app.services.card_serialization import (
    card_load_only_attrs,
    safe_annual_fee,
    safe_network,
    safe_signup_bonus,
)
from app.services.reward_eligibility import is_reward_eligible, utc_today

logger = logging.getLogger(__name__)


def _reward_to_match(reward: Reward) -> StoreCardMatch | None:
    try:
        card = reward.card
        if not card:
            return None
        return StoreCardMatch(
            card_id=card.id,
            card_name=card.card_name or "Unknown card",
            issuer=card.issuer or "Unknown",
            cashback_percent=reward.cashback_percent,
            reward_type=reward.reward_type,
            annual_fee=safe_annual_fee(card),
            expires_at=reward.end_date,
            signup_bonus=safe_signup_bonus(card),
            network=safe_network(card),
        )
    except Exception:
        logger.exception("Skipping reward id=%s due to serialization error", getattr(reward, "id", "?"))
        return None


def get_store_cards(
    db: Session,
    store_name: str,
    as_of: date | None = None,
) -> StoreCardsResponse:
    today = as_of or utc_today()
    store = store_crud.get_store_by_name(db, store_name)

    if not store:
        logger.info("Store not found: %s — returning empty cards list", store_name)
        return StoreCardsResponse(
            store_name=store_name,
            store_category="",
            as_of_date=today,
            cards=[],
        )

    try:
        load_attrs = card_load_only_attrs(db)
        stmt = (
            select(Reward)
            .options(joinedload(Reward.card).load_only(*load_attrs))
            .where(Reward.store_id == store.id, Reward.is_active.is_(True))
            .order_by(Reward.cashback_percent.desc())
        )
        rewards = list(db.scalars(stmt).unique().all())
    except Exception:
        logger.exception("Failed to load rewards for store=%s", store_name)
        return StoreCardsResponse(
            store_name=store.name,
            store_category=store.category,
            as_of_date=today,
            cards=[],
        )

    eligible = [r for r in rewards if is_reward_eligible(r, today)]

    best_by_card: dict[int, StoreCardMatch] = {}
    for reward in eligible:
        match = _reward_to_match(reward)
        if not match:
            continue
        existing = best_by_card.get(match.card_id)
        if not existing or match.cashback_percent > existing.cashback_percent:
            best_by_card[match.card_id] = match

    cards = sorted(best_by_card.values(), key=lambda c: c.cashback_percent, reverse=True)
    logger.info("Store %s: returning %d card(s)", store.name, len(cards))

    return StoreCardsResponse(
        store_name=store.name,
        store_category=store.category,
        as_of_date=today,
        cards=cards,
    )
