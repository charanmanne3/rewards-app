"""
Add stores/rewards missing from initial seed (e.g. 7-Eleven).

Usage:
  python -m scripts.upsert_extra_stores
"""

import logging
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.credit_card import CreditCard
from app.models.enums import RewardType
from app.models.reward import Reward
from app.models.store import Store

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EXTRA_STORES = [
    ("7-Eleven", "Convenience & Gas"),
]

EXTRA_REWARDS = [
    ("7-Eleven", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 6, 30)),
    ("7-Eleven", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("7-Eleven", "Apple Card", 2.0, RewardType.STATIC, date(2026, 1, 1), None),
    ("7-Eleven", "Citi Double Cash", 2.0, RewardType.STATIC, date(2026, 1, 1), None),
]


def upsert() -> None:
    db = SessionLocal()
    try:
        store_map = {s.name: s for s in db.scalars(select(Store)).all()}
        card_map = {c.card_name: c for c in db.scalars(select(CreditCard)).all()}

        for name, category in EXTRA_STORES:
            if name not in store_map:
                s = Store(name=name, category=category)
                db.add(s)
                db.flush()
                store_map[name] = s
                logger.info("Added store %s", name)

        added = 0
        for store_name, card_name, pct, rtype, start, end in EXTRA_REWARDS:
            store = store_map.get(store_name)
            card = card_map.get(card_name)
            if not store or not card:
                logger.warning("Skip %s / %s — missing store or card", store_name, card_name)
                continue
            existing = db.scalar(
                select(Reward).where(
                    Reward.store_id == store.id,
                    Reward.card_id == card.id,
                    Reward.reward_type == rtype,
                )
            )
            if existing:
                continue
            db.add(
                Reward(
                    store_id=store.id,
                    card_id=card.id,
                    cashback_percent=pct,
                    reward_type=rtype,
                    start_date=start,
                    end_date=end,
                    is_active=True,
                )
            )
            added += 1

        db.commit()
        logger.info("Upsert complete — %d new rewards", added)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    upsert()
