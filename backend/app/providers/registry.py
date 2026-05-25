"""Provider registry — registers adapters and filters by DB-enabled state."""

from sqlalchemy.orm import Session

from app.crud import provider as provider_crud
from app.providers.base import CashbackProvider
from app.providers.cached_offer_provider import CachedOfferProvider
from app.providers.database_provider import DatabaseRewardProvider
from app.providers.stub_providers import (
    AffiliateProvider,
    AIRecommendationProvider,
    PlaidProvider,
    StripeFinancialProvider,
)

_ALL_INSTANCES: list[CashbackProvider] = [
    AIRecommendationProvider(),
    DatabaseRewardProvider(),
    CachedOfferProvider(),
    AffiliateProvider(),
    PlaidProvider(),
    StripeFinancialProvider(),
]

_BY_SLUG = {p.slug: p for p in _ALL_INSTANCES}

_DEFAULT_ENABLED = {"database", "cached"}


def get_enabled_providers(db: Session | None = None) -> list[CashbackProvider]:
    if db is None:
        return sorted(
            [p for p in _ALL_INSTANCES if p.slug in _DEFAULT_ENABLED],
            key=lambda p: p.priority,
        )

    provider_crud.upsert_default_providers(db)
    rows = provider_crud.get_providers(db, enabled_only=True)
    enabled_slugs = {r.slug for r in rows}
    enabled = [p for p in _ALL_INSTANCES if p.slug in enabled_slugs]
    return sorted(enabled, key=lambda p: p.priority)


def get_provider_by_slug(slug: str) -> CashbackProvider | None:
    return _BY_SLUG.get(slug)
