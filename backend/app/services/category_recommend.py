"""
Recommend cards by aggregate store reward category.

Matches `Store.category` case-insensitively (substring) against the user's
category query (e.g. dining → Dining & Coffee). Per card, keeps the best
eligible reward rate among matching stores.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.credit_card import CreditCard
from app.models.reward import Reward
from app.models.store import Store
from app.schemas.category_recommend import CategoryRecommendItem
from app.services.reward_eligibility import is_reward_eligible, utc_today


def _escape_ilike(term: str) -> str:
    """Escape `%` and `_` for SQL LIKE/ILIKE with backslash escape."""
    return (
        term.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


def _format_reward_rate(cashback_percent: float) -> str:
    """Display rate as multiplier-style string (matches API examples)."""
    if cashback_percent == int(cashback_percent):
        return f"{int(cashback_percent)}x"
    return f"{cashback_percent:g}x"


def get_recommendations_by_category(
    db: Session,
    category: str,
    *,
    as_of=None,
) -> list[CategoryRecommendItem]:
    """
    Return cards with best eligible reward rate for stores whose category matches.

    Sorted by cashback_percent descending (highest first).
    """
    needle = category.strip()
    if not needle:
        return []

    escaped = _escape_ilike(needle)
    pattern = f"%{escaped}%"

    stmt = (
        select(Reward)
        .join(Store, Reward.store_id == Store.id)
        .join(CreditCard, Reward.card_id == CreditCard.id)
        .where(Store.category.ilike(pattern, escape="\\"))
        .where(Reward.is_active.is_(True))
        .options(
            joinedload(Reward.store),
            joinedload(Reward.card),
        )
    )
    rewards = list(db.scalars(stmt).unique().all())
    today = as_of or utc_today()

    eligible = [r for r in rewards if is_reward_eligible(r, today)]

    # card_id → (best_percent, exemplar_reward)
    best: dict[int, tuple[float, Reward]] = {}
    for r in eligible:
        if not r.store or not r.card:
            continue
        cur = best.get(r.card_id)
        if cur is None or r.cashback_percent > cur[0]:
            best[r.card_id] = (r.cashback_percent, r)

    rows_by_rate: list[tuple[float, Reward]] = sorted(
        best.values(),
        key=lambda item: (-item[0], item[1].card.card_name.lower() if item[1].card else ""),
    )

    return [
        CategoryRecommendItem(
            card_name=winner.card.card_name,
            reward_category=winner.store.category if winner.store else needle,
            reward_rate=_format_reward_rate(rate),
            annual_fee=(
                winner.card.annual_fee
                if winner.card and winner.card.annual_fee is not None
                else None
            ),
        )
        for rate, winner in rows_by_rate
    ]
