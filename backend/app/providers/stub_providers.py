"""Placeholder adapters for future affiliate, Plaid, Stripe, and AI integrations."""

import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.providers.base import CashbackProvider, ProviderFetchResult

logger = logging.getLogger(__name__)


class _ExternalStubProvider(CashbackProvider):
    """Base stub — returns empty until API keys and integrations are configured."""

    settings_key: str = ""

    def fetch_offers(
        self,
        db: Session,
        store_name: str,
        categories: list[str] | None = None,
    ) -> ProviderFetchResult:
        settings = get_settings()
        configured = bool(getattr(settings, self.settings_key, "") or "")
        return ProviderFetchResult(
            provider_slug=self.slug,
            display_name=self.display_name,
            offers=[],
            fetched_at=datetime.now(timezone.utc),
            status="configured" if configured else "stub",
            error_message=None if configured else f"{self.display_name} integration pending",
        )


class AffiliateProvider(_ExternalStubProvider):
    slug = "affiliate"
    display_name = "Affiliate Network"
    priority = 50
    settings_key = "affiliate_api_key"


class PlaidProvider(_ExternalStubProvider):
    slug = "plaid"
    display_name = "Plaid Wallet"
    priority = 60
    settings_key = "plaid_client_id"


class StripeFinancialProvider(_ExternalStubProvider):
    slug = "stripe_fc"
    display_name = "Stripe Financial Connections"
    priority = 70
    settings_key = "stripe_secret_key"


class AIRecommendationProvider(_ExternalStubProvider):
    slug = "ai"
    display_name = "AI Recommendations"
    priority = 5
    settings_key = "openai_api_key"
