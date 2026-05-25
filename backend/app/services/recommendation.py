"""
Recommendation engine — uses only database-driven, currently eligible rewards.

Deduplicates by card (keeps highest cashback). Results cached briefly for scale.
"""

import logging
from datetime import date

from sqlalchemy.orm import Session

from app.core.cache import recommendation_cache
from app.crud import reward as reward_crud
from app.crud import store as store_crud
from app.schemas.recommendation import BestCardRecommendation, CardRewardRank
from app.services.reward_eligibility import utc_today

logger = logging.getLogger(__name__)


def _cache_key(store_name: str, as_of: date) -> str:
    return f"rec:{store_name.lower()}:{as_of.isoformat()}"


def _rank_rewards(rewards: list) -> list[CardRewardRank]:
    """One entry per card — highest eligible cashback wins."""
    best_by_card: dict[int, CardRewardRank] = {}
    for r in rewards:
        rank = CardRewardRank(
            card_id=r.card.id,
            card_name=r.card.card_name,
            issuer=r.card.issuer,
            cashback_percent=r.cashback_percent,
            reward_type=r.reward_type,
            reward_id=r.id,
            start_date=r.start_date,
            end_date=r.end_date,
        )
        existing = best_by_card.get(r.card_id)
        if not existing or rank.cashback_percent > existing.cashback_percent:
            best_by_card[r.card_id] = rank

    return sorted(best_by_card.values(), key=lambda x: x.cashback_percent, reverse=True)


def get_best_cards_for_store(
    db: Session,
    store_name: str,
    as_of: date | None = None,
    use_cache: bool = True,
) -> BestCardRecommendation | None:
    today = as_of or utc_today()
    cache_key = _cache_key(store_name, today)

    if use_cache:
        cached = recommendation_cache.get(cache_key)
        if cached is not None:
            logger.debug("Cache hit for %s", cache_key)
            return cached

    store = store_crud.get_store_by_name(db, store_name)
    if not store:
        logger.info("Store not found: %s", store_name)
        return None

    rewards = reward_crud.get_active_rewards_for_store(db, store.id, as_of=today)
    ranked = _rank_rewards(rewards)

    result = BestCardRecommendation(
        store_name=store.name,
        store_category=store.category,
        as_of_date=today,
        best_card=ranked[0] if ranked else None,
        all_ranked_cards=ranked,
    )

    if use_cache and ranked:
        recommendation_cache.set(cache_key, result)

    return result
