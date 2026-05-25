"""Sync provider offers into PostgreSQL store_offers cache."""

import logging

from sqlalchemy.orm import Session

from app.core.cache import recommendation_cache
from app.crud import provider as provider_crud
from app.crud import store as store_crud
from app.crud import store_offer as offer_crud
from app.providers.database_provider import DatabaseRewardProvider

logger = logging.getLogger(__name__)


def refresh_store_offers(db: Session, store_name: str) -> dict[str, int]:
    """Fetch from database provider and persist to cached offers table."""
    store = store_crud.get_store_by_name(db, store_name)
    if not store:
        return {"store": store_name, "offers": 0}

    cached_provider = provider_crud.get_provider_by_slug(db, "cached")
    if not cached_provider:
        provider_crud.upsert_default_providers(db)
        cached_provider = provider_crud.get_provider_by_slug(db, "cached")
    if not cached_provider:
        return {"store": store_name, "offers": 0}

    db_provider = DatabaseRewardProvider()
    result = db_provider.fetch_offers(db, store.name)
    count = offer_crud.replace_provider_offers(
        db, store.id, cached_provider.id, result.offers
    )
    offer_crud.upsert_sync_log(
        db,
        store.id,
        cached_provider.id,
        status=result.status,
        offer_count=count,
        error_message=result.error_message,
    )
    provider_crud.touch_provider_sync(db, cached_provider.id)
    db.commit()
    recommendation_cache.clear()
    logger.info("Refreshed %s offers for store=%s", count, store.name)
    return {"store": store.name, "offers": count}


def refresh_all_stores(db: Session) -> dict[str, int]:
    provider_crud.upsert_default_providers(db)
    stores = store_crud.get_stores(db)
    total = 0
    for store in stores:
        stats = refresh_store_offers(db, store.name)
        total += stats.get("offers", 0)
    return {"stores": len(stores), "offers": total}


def warm_provider_cache(db: Session) -> None:
    """Pre-fetch from all enabled providers for every store (in-memory cache)."""
    from app.services.unified_recommendation import get_unified_recommendations

    stores = store_crud.get_stores(db)
    for store in stores:
        get_unified_recommendations(db, store.name, use_cache=True)
    logger.info("Warmed recommendation cache for %s stores", len(stores))
