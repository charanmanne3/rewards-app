"""Cashback provider adapters — aggregate offers from multiple sources."""

from app.providers.base import CashbackProvider, NormalizedOffer, ProviderFetchResult
from app.providers.registry import get_enabled_providers, get_provider_by_slug

__all__ = [
    "CashbackProvider",
    "NormalizedOffer",
    "ProviderFetchResult",
    "get_enabled_providers",
    "get_provider_by_slug",
]
