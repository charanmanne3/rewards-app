"""Map ORM Reward rows to API response schemas."""

from app.models.reward import Reward
from app.schemas.reward import RewardRead
from app.services.reward_eligibility import is_reward_eligible


def to_reward_read(reward: Reward) -> RewardRead:
    return RewardRead(
        id=reward.id,
        store_id=reward.store_id,
        card_id=reward.card_id,
        cashback_percent=reward.cashback_percent,
        reward_type=reward.reward_type,
        start_date=reward.start_date,
        end_date=reward.end_date,
        is_active=reward.is_active,
        created_at=reward.created_at,
        updated_at=reward.updated_at,
        store_name=reward.store.name if reward.store else None,
        card_name=reward.card.card_name if reward.card else None,
        issuer=reward.card.issuer if reward.card else None,
        is_currently_eligible=is_reward_eligible(reward),
    )
