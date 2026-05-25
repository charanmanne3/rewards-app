"""
Automatic expiration: deactivate rewards whose end_date has passed.

Runnable from:
- APScheduler (in-process)
- scripts/run_expiration_cleanup.py (cron / AWS Lambda / EventBridge)
"""

import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.cache import recommendation_cache
from app.models.reward import Reward
from app.services.reward_eligibility import should_auto_deactivate

logger = logging.getLogger(__name__)


def deactivate_expired_rewards(db: Session) -> int:
    stmt = select(Reward).where(Reward.is_active.is_(True), Reward.end_date.isnot(None))
    rewards = list(db.scalars(stmt).all())

    count = 0
    for reward in rewards:
        if should_auto_deactivate(reward):
            reward.is_active = False
            count += 1
            logger.info(
                "Deactivated expired reward id=%s store_id=%s card_id=%s end_date=%s",
                reward.id,
                reward.store_id,
                reward.card_id,
                reward.end_date,
            )

    if count:
        db.commit()
        recommendation_cache.clear()
        logger.info("Deactivated %d expired reward(s)", count)
    return count
