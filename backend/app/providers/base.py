"""Base interface for cashback provider adapters."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import date, datetime

from sqlalchemy.orm import Session

from app.models.enums import RewardType


@dataclass
class NormalizedOffer:
    """Unified offer shape across all providers."""

    provider_slug: str
    store_name: str
    card_id: int | None
    card_name: str
    issuer: str
    cashback_percent: float
    reward_type: RewardType
    annual_fee: float | None = None
    signup_bonus: str | None = None
    network: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    external_id: str | None = None
    raw_payload: dict | None = None


@dataclass
class ProviderFetchResult:
    provider_slug: str
    display_name: str
    offers: list[NormalizedOffer] = field(default_factory=list)
    fetched_at: datetime | None = None
    status: str = "ok"
    error_message: str | None = None


class CashbackProvider(ABC):
    """Adapter interface — implement for DB, affiliate, Plaid, Stripe, AI, etc."""

    slug: str
    display_name: str
    priority: int = 100

    @abstractmethod
    def fetch_offers(
        self,
        db: Session,
        store_name: str,
        categories: list[str] | None = None,
    ) -> ProviderFetchResult:
        """Fetch and normalize offers for a store."""

    def normalize_cashback(self, value: float) -> float:
        """Clamp and round cashback to a consistent scale."""
        return round(max(0.0, min(value, 100.0)), 2)
