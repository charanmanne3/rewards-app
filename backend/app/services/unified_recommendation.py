"""
Unified recommendation engine — aggregates offers from all enabled providers,
normalizes cashback, ranks matches, and supports owned-card boosting.
"""

import logging
from datetime import date

from sqlalchemy.orm import Session

from app.core.cache import recommendation_cache
from app.crud import store as store_crud
from app.providers.base import NormalizedOffer, ProviderFetchResult
from app.providers.registry import get_enabled_providers
from app.schemas.unified_recommendation import (
    ProviderSource,
    RecommendationMatch,
    RecommendationMeta,
    RecommendationResponse,
)
from app.services.reward_eligibility import utc_today

logger = logging.getLogger(__name__)

ENGINE_VERSION = "2.1.0"


def _cache_key(store: str, owned: tuple[str, ...], categories: tuple[str, ...], as_of: date) -> str:
    return f"unified:{store.lower()}:{as_of.isoformat()}:{','.join(sorted(owned))}:{','.join(sorted(categories))}"


def _is_owned(card_name: str, issuer: str, owned_cards: list[str]) -> bool:
    if not owned_cards:
        return False
    needle = f"{card_name} {issuer}".lower()
    for owned in owned_cards:
        o = owned.lower().strip()
        if o in needle or o in card_name.lower() or o in issuer.lower():
            return True
    return False


def _merge_offers(all_results: list[ProviderFetchResult]) -> list[NormalizedOffer]:
    """Deduplicate by card — highest normalized cashback wins."""
    best: dict[str, NormalizedOffer] = {}
    for result in all_results:
        for offer in result.offers:
            key = str(offer.card_id) if offer.card_id else offer.card_name.lower()
            existing = best.get(key)
            if not existing or offer.cashback_percent > existing.cashback_percent:
                best[key] = offer
    return list(best.values())


def _rank_matches(
    offers: list[NormalizedOffer],
    owned_cards: list[str],
) -> list[RecommendationMatch]:
    matches: list[RecommendationMatch] = []
    for offer in offers:
        owned = _is_owned(offer.card_name, offer.issuer, owned_cards)
        confidence = 0.95 if offer.provider_slug == "database" else 0.85
        if owned:
            confidence = min(1.0, confidence + 0.05)
        matches.append(
            RecommendationMatch(
                card_id=offer.card_id,
                card_name=offer.card_name,
                issuer=offer.issuer,
                cashback_percent=offer.cashback_percent,
                reward_type=offer.reward_type,
                annual_fee=offer.annual_fee,
                signup_bonus=offer.signup_bonus,
                network=offer.network,
                expires_at=offer.end_date,
                provider_source=offer.provider_slug,
                is_owned=owned,
                confidence=confidence,
            )
        )

    def sort_key(m: RecommendationMatch) -> tuple[float, float]:
        owned_boost = 0.5 if m.is_owned else 0.0
        return (m.cashback_percent + owned_boost, m.confidence)

    return sorted(matches, key=sort_key, reverse=True)


def get_unified_recommendations(
    db: Session,
    store_name: str,
    owned_cards: list[str] | None = None,
    categories: list[str] | None = None,
    as_of: date | None = None,
    use_cache: bool = True,
) -> RecommendationResponse:
    today = as_of or utc_today()
    owned = owned_cards or []
    cats = categories or []
    cache_key = _cache_key(store_name, tuple(owned), tuple(cats), today)

    if use_cache:
        cached = recommendation_cache.get(cache_key)
        if cached is not None:
            if isinstance(cached, RecommendationResponse):
                cached.meta.cache_hit = True
                return cached

    store = store_crud.get_store_by_name(db, store_name)
    if not store:
        return RecommendationResponse(
            store_name=store_name,
            store_category="",
            as_of_date=today,
            meta=RecommendationMeta(engine_version=ENGINE_VERSION),
        )

    providers = get_enabled_providers(db)
    fetch_results: list[ProviderFetchResult] = []
    provider_sources: list[ProviderSource] = []

    for provider in providers:
        try:
            result = provider.fetch_offers(db, store.name, cats or None)
            fetch_results.append(result)
            provider_sources.append(
                ProviderSource(
                    provider=result.provider_slug,
                    display_name=result.display_name,
                    offer_count=len(result.offers),
                    last_refreshed_at=result.fetched_at,
                    status=result.status,
                    error_message=result.error_message,
                )
            )
        except Exception as exc:
            logger.exception("Provider %s failed", provider.slug)
            provider_sources.append(
                ProviderSource(
                    provider=provider.slug,
                    display_name=provider.display_name,
                    status="error",
                    error_message=str(exc),
                )
            )

    merged = _merge_offers(fetch_results)
    ranked = _rank_matches(merged, owned)

    response = RecommendationResponse(
        store_name=store.name,
        store_category=store.category,
        as_of_date=today,
        best_card=ranked[0] if ranked else None,
        all_matches=ranked,
        provider_sources=provider_sources,
        meta=RecommendationMeta(
            engine_version=ENGINE_VERSION,
            providers_queried=len(providers),
            owned_cards_filter=bool(owned),
            ai_enabled=any(p.provider == "ai" and p.status == "configured" for p in provider_sources),
        ),
    )

    if use_cache and ranked:
        recommendation_cache.set(cache_key, response)

    return response
