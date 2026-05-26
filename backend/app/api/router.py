"""Aggregate all API route modules."""

from fastapi import APIRouter

from app.api.routes import (
    admin_rewards,
    cards,
    catalog,
    recommend_category,
    recommendations,
    stores,
    unified_recommendations,
    users,
)

api_router = APIRouter()
api_router.include_router(stores.router)
api_router.include_router(cards.router)
api_router.include_router(recommend_category.router)
api_router.include_router(catalog.router)
api_router.include_router(recommendations.router)
api_router.include_router(unified_recommendations.router)
api_router.include_router(users.router)
api_router.include_router(admin_rewards.router)
