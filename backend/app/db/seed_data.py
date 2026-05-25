"""
Seed stores, cards, and database-driven rewards (static, rotating, promotional).

Called automatically on API startup when tables are empty.
Manual run: python -m scripts.seed
"""

import logging
from dataclasses import dataclass
from datetime import date

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.models.credit_card import CreditCard
from app.models.enums import RewardType
from app.models.reward import Reward
from app.models.store import Store

logger = logging.getLogger(__name__)

STORES = [
    ("7-Eleven", "Convenience & Gas"),
    ("Walmart", "Grocery & General"),
    ("Target", "Department Store"),
    ("Amazon", "Online Retail"),
    ("Costco", "Warehouse Club"),
    ("Best Buy", "Electronics"),
    ("Kroger", "Grocery"),
    ("CVS", "Pharmacy"),
    ("Walgreens", "Pharmacy"),
    ("Home Depot", "Home Improvement"),
    ("Starbucks", "Dining & Coffee"),
]

# card_name, issuer, annual_fee, signup_bonus, network
CARDS = [
    ("Chase Freedom Flex", "Chase", 0, "$200 after $500 spend", "Visa"),
    ("Discover IT", "Discover", 0, "Cashback Match year 1", "Discover"),
    ("Citi Double Cash", "Citi", 0, None, "Mastercard"),
    ("Amex Gold", "American Express", 250, "60,000 Membership Rewards", "Amex"),
    ("Capital One Venture X", "Capital One", 395, "75,000 miles", "Visa"),
    ("Amex Blue Cash Preferred", "American Express", 95, "$250 statement credit", "Amex"),
    ("Apple Card", "Goldman Sachs", 0, "Daily Cash", "Mastercard"),
    ("Wells Fargo Active Cash", "Wells Fargo", 0, "$200 cash rewards", "Visa"),
    ("Chase Sapphire Preferred", "Chase", 95, "60,000 points", "Visa"),
    ("Capital One Savor", "Capital One", 0, "$200 cash bonus", "Mastercard"),
]

# Ongoing STATIC baselines: effective from this date, no end (NULL in DB)
STATIC_DEFAULT_START = date(2026, 1, 1)


@dataclass
class SeedReward:
    store_name: str
    card_name: str
    cashback_percent: float
    reward_type: RewardType
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool = True


def reward_row(
    store: str,
    card: str,
    pct: float,
    rtype: RewardType,
    start: date | None = None,
    end: date | None = None,
    *,
    is_active: bool = True,
) -> SeedReward:
    """
    Build a seed reward with consistent dates.

    STATIC: defaults to start=2026-01-01, end=None (ongoing).
    ROTATING / PROMOTIONAL: start and end are required.
    """
    if rtype == RewardType.STATIC:
        return SeedReward(
            store,
            card,
            pct,
            rtype,
            start_date=start or STATIC_DEFAULT_START,
            end_date=end,
            is_active=is_active,
        )
    if start is None or end is None:
        raise ValueError(
            f"{rtype.value} reward {store}/{card} requires start and end dates"
        )
    return SeedReward(
        store, card, pct, rtype, start_date=start, end_date=end, is_active=is_active
    )


# (store, card, pct, reward_type, start_date, end_date) — always 6 fields; use None for STATIC end
RAW_REWARDS: list[tuple[str, str, float, RewardType, date | None, date | None]] = [
    # STATIC baselines (start defaulted; end None = ongoing)
    ("Walmart", "Citi Double Cash", 2.0, RewardType.STATIC, None, None),
    ("Walmart", "Wells Fargo Active Cash", 2.0, RewardType.STATIC, None, None),
    ("Target", "Apple Card", 2.0, RewardType.STATIC, None, None),
    ("Amazon", "Citi Double Cash", 2.0, RewardType.STATIC, None, None),
    ("Starbucks", "Apple Card", 2.0, RewardType.STATIC, None, None),
    ("Kroger", "Amex Blue Cash Preferred", 6.0, RewardType.STATIC, None, None),
    ("CVS", "Amex Blue Cash Preferred", 6.0, RewardType.STATIC, None, None),
    ("Walgreens", "Amex Blue Cash Preferred", 6.0, RewardType.STATIC, None, None),
    ("Amazon", "Chase Sapphire Preferred", 3.0, RewardType.STATIC, None, None),
    ("Costco", "Capital One Venture X", 2.0, RewardType.STATIC, None, None),
    ("Amazon", "Apple Card", 3.0, RewardType.STATIC, None, None),
    ("Best Buy", "Citi Double Cash", 2.0, RewardType.STATIC, None, None),
    ("Home Depot", "Chase Sapphire Preferred", 3.0, RewardType.STATIC, None, None),
    ("Starbucks", "Chase Sapphire Preferred", 3.0, RewardType.STATIC, None, None),
    ("Starbucks", "Discover IT", 2.0, RewardType.STATIC, None, None),
    # ROTATING
    ("Walmart", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Amazon", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("Target", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Best Buy", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Home Depot", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("Walmart", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("Target", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Amazon", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 7, 1), date(2026, 9, 30)),
    ("Costco", "Chase Freedom Flex", 3.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Kroger", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("Kroger", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("CVS", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("CVS", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("Walgreens", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Walgreens", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("Home Depot", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("Starbucks", "Chase Freedom Flex", 3.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 3, 31)),
    ("7-Eleven", "Discover IT", 5.0, RewardType.ROTATING, date(2026, 1, 1), date(2026, 6, 30)),
    ("7-Eleven", "Chase Freedom Flex", 5.0, RewardType.ROTATING, date(2026, 4, 1), date(2026, 6, 30)),
    ("7-Eleven", "Apple Card", 2.0, RewardType.STATIC, None, None),
    ("7-Eleven", "Citi Double Cash", 2.0, RewardType.STATIC, None, None),
    # PROMOTIONAL
    ("Walmart", "Amex Blue Cash Preferred", 6.0, RewardType.PROMOTIONAL, date(2026, 5, 1), date(2026, 5, 31)),
    ("Starbucks", "Amex Gold", 4.0, RewardType.PROMOTIONAL, date(2026, 1, 1), date(2026, 12, 31)),
    ("Starbucks", "Capital One Savor", 4.0, RewardType.PROMOTIONAL, date(2026, 1, 1), date(2026, 12, 31)),
    ("Target", "Capital One Savor", 4.0, RewardType.PROMOTIONAL, date(2026, 2, 1), date(2026, 2, 28)),
    # Expired sample (past end_date; cleanup job will set is_active=false)
    ("Best Buy", "Discover IT", 5.0, RewardType.PROMOTIONAL, date(2025, 11, 1), date(2025, 12, 31)),
]

REWARDS: list[SeedReward] = [
    reward_row(store, card, pct, rtype, start, end)
    for store, card, pct, rtype, start, end in RAW_REWARDS
]


def seed_if_empty() -> bool:
    """
    Insert reference data only when no stores exist.

    Returns True if seed ran, False if skipped. Safe on repeated startup.
    """
    db = SessionLocal()
    try:
        if db.scalars(select(Store)).first():
            logger.info("Database already has data; skipping seed")
            return False

        store_map: dict[str, Store] = {}
        for name, category in STORES:
            s = Store(name=name, category=category)
            db.add(s)
            store_map[name] = s

        card_map: dict[str, CreditCard] = {}
        for card_name, issuer, annual_fee, signup_bonus, network in CARDS:
            c = CreditCard(
                card_name=card_name,
                issuer=issuer,
                annual_fee=annual_fee,
                signup_bonus=signup_bonus,
                network=network,
            )
            db.add(c)
            card_map[card_name] = c

        db.flush()
        count = 0
        for entry in REWARDS:
            store = store_map.get(entry.store_name)
            card = card_map.get(entry.card_name)
            if not store or not card:
                logger.warning("Skipping unknown mapping: %s / %s", entry.store_name, entry.card_name)
                continue
            db.add(
                Reward(
                    store_id=store.id,
                    card_id=card.id,
                    cashback_percent=entry.cashback_percent,
                    reward_type=entry.reward_type,
                    start_date=entry.start_date,
                    end_date=entry.end_date,
                    is_active=entry.is_active,
                )
            )
            count += 1

        db.commit()
        logger.info(
            "Seeded %d stores, %d cards, %d rewards",
            len(STORES),
            len(CARDS),
            count,
        )
        return True
    except IntegrityError:
        db.rollback()
        logger.info("Seed skipped (data already present)")
        return False
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
