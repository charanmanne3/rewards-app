from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.reward import Reward
from app.schemas.reward import RewardCreate, RewardUpdate
from app.services.reward_eligibility import is_reward_eligible, utc_today


def _base_query():
    return select(Reward).options(
        joinedload(Reward.card),
        joinedload(Reward.store),
    )


def get_reward_by_id(db: Session, reward_id: int) -> Reward | None:
    stmt = _base_query().where(Reward.id == reward_id)
    return db.scalars(stmt).first()


def get_active_rewards_for_store(db: Session, store_id: int, as_of: date | None = None) -> list[Reward]:
    """Eligible rewards for recommendations (filtered in Python for date rules)."""
    stmt = (
        _base_query()
        .where(Reward.store_id == store_id, Reward.is_active.is_(True))
        .order_by(Reward.cashback_percent.desc())
    )
    rewards = list(db.scalars(stmt).unique().all())
    return [r for r in rewards if is_reward_eligible(r, as_of)]


def list_rewards_admin(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    store_id: int | None = None,
    card_id: int | None = None,
    reward_type: str | None = None,
    active_only: bool | None = None,
    eligible_only: bool | None = None,
) -> tuple[list[Reward], int]:
    stmt = _base_query()
    count_stmt = select(func.count()).select_from(Reward)

    if store_id is not None:
        stmt = stmt.where(Reward.store_id == store_id)
        count_stmt = count_stmt.where(Reward.store_id == store_id)
    if card_id is not None:
        stmt = stmt.where(Reward.card_id == card_id)
        count_stmt = count_stmt.where(Reward.card_id == card_id)
    if reward_type is not None:
        stmt = stmt.where(Reward.reward_type == reward_type)
        count_stmt = count_stmt.where(Reward.reward_type == reward_type)
    if active_only is True:
        stmt = stmt.where(Reward.is_active.is_(True))
        count_stmt = count_stmt.where(Reward.is_active.is_(True))
    elif active_only is False:
        stmt = stmt.where(Reward.is_active.is_(False))
        count_stmt = count_stmt.where(Reward.is_active.is_(False))

    total = db.scalar(count_stmt) or 0
    stmt = stmt.order_by(Reward.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = list(db.scalars(stmt).unique().all())

    if eligible_only:
        items = [r for r in items if is_reward_eligible(r)]

    return items, total


def create_reward(db: Session, payload: RewardCreate) -> Reward:
    reward = Reward(**payload.model_dump())
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return get_reward_by_id(db, reward.id)  # type: ignore[return-value]


def update_reward(db: Session, reward: Reward, payload: RewardUpdate) -> Reward:
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(reward, key, value)
    db.commit()
    db.refresh(reward)
    return get_reward_by_id(db, reward.id)  # type: ignore[return-value]


def deactivate_reward(db: Session, reward: Reward) -> Reward:
    reward.is_active = False
    db.commit()
    db.refresh(reward)
    return reward


def get_expired_active_rewards(db: Session) -> list[Reward]:
    today = utc_today()
    stmt = select(Reward).where(
        Reward.is_active.is_(True),
        Reward.end_date.isnot(None),
        Reward.end_date < today,
    )
    return list(db.scalars(stmt).all())


def get_eligible_rewards(
    db: Session,
    *,
    reward_type: str | None = None,
    as_of: date | None = None,
) -> list[Reward]:
    """Public catalog: active rewards filtered by eligibility and optional type."""
    stmt = _base_query().where(Reward.is_active.is_(True))
    if reward_type is not None:
        stmt = stmt.where(Reward.reward_type == reward_type)
    stmt = stmt.order_by(Reward.cashback_percent.desc())
    rewards = list(db.scalars(stmt).unique().all())
    return [r for r in rewards if is_reward_eligible(r, as_of)]
