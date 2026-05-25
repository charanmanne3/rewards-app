"""
Admin reward management — database-driven updates without code deploys.

All routes require header: X-Admin-API-Key: <ADMIN_API_KEY>
"""

import logging
import math

from fastapi import APIRouter, HTTPException, Query, status

from app.api.deps import AdminAuth, DbSession, Pagination
from app.core.cache import recommendation_cache
from app.crud import reward as reward_crud
from app.models.enums import RewardType
from app.schemas.common import PaginatedResponse
from app.schemas.reward import RewardCreate, RewardDeactivateResponse, RewardRead, RewardUpdate
from app.services.reward_expiration import deactivate_expired_rewards
from app.services.reward_mapper import to_reward_read

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/rewards", tags=["admin-rewards"])


@router.get("", response_model=PaginatedResponse[RewardRead])
def list_rewards(
    _admin: AdminAuth,
    db: DbSession,
    pagination: Pagination,
    store_id: int | None = Query(None),
    card_id: int | None = Query(None),
    reward_type: RewardType | None = Query(None),
    active_only: bool | None = Query(None),
    eligible_only: bool | None = Query(None, description="Only rewards valid today"),
) -> PaginatedResponse[RewardRead]:
    page, page_size = pagination
    items, total = reward_crud.list_rewards_admin(
        db,
        page=page,
        page_size=page_size,
        store_id=store_id,
        card_id=card_id,
        reward_type=reward_type.value if reward_type else None,
        active_only=active_only,
        eligible_only=eligible_only,
    )
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedResponse(
        items=[to_reward_read(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.post("", response_model=RewardRead, status_code=status.HTTP_201_CREATED)
def create_reward(
    _admin: AdminAuth,
    db: DbSession,
    payload: RewardCreate,
) -> RewardRead:
    reward = reward_crud.create_reward(db, payload)
    recommendation_cache.clear()
    logger.info("Admin created reward id=%s", reward.id)
    return to_reward_read(reward)


@router.patch("/{reward_id}", response_model=RewardRead)
def update_reward(
    reward_id: int,
    _admin: AdminAuth,
    db: DbSession,
    payload: RewardUpdate,
) -> RewardRead:
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(status_code=400, detail="No fields to update")

    reward = reward_crud.get_reward_by_id(db, reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    reward = reward_crud.update_reward(db, reward, payload)
    recommendation_cache.clear()
    logger.info("Admin updated reward id=%s", reward_id)
    return to_reward_read(reward)


@router.post("/{reward_id}/deactivate", response_model=RewardDeactivateResponse)
def deactivate_reward(
    reward_id: int,
    _admin: AdminAuth,
    db: DbSession,
) -> RewardDeactivateResponse:
    reward = reward_crud.get_reward_by_id(db, reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    reward_crud.deactivate_reward(db, reward)
    recommendation_cache.clear()
    return RewardDeactivateResponse(
        id=reward_id,
        is_active=False,
        message="Reward deactivated successfully",
    )


@router.post("/jobs/expire", response_model=dict)
def run_expiration_cleanup(
    _admin: AdminAuth,
    db: DbSession,
) -> dict:
    """Manually trigger expired-reward deactivation (same logic as scheduled job)."""
    count = deactivate_expired_rewards(db)
    return {"deactivated_count": count, "message": "Expiration cleanup completed"}
