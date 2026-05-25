"""Request/response schemas for unified recommendations API."""

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.enums import RewardType


class RecommendationRequest(BaseModel):
    store: str = Field(..., min_length=1, max_length=120)
    owned_cards: list[str] = Field(default_factory=list)
    categories: list[str] = Field(default_factory=list)


class ProviderSource(BaseModel):
    provider: str
    display_name: str
    offer_count: int = 0
    last_refreshed_at: datetime | None = None
    status: str = "ok"
    error_message: str | None = None


class RecommendationMatch(BaseModel):
    card_id: int | None = None
    card_name: str
    issuer: str
    cashback_percent: float = Field(..., ge=0)
    reward_type: RewardType
    annual_fee: float | None = None
    signup_bonus: str | None = None
    network: str | None = None
    expires_at: date | None = None
    provider_source: str
    is_owned: bool = False
    confidence: float = Field(default=1.0, ge=0, le=1)


class RecommendationMeta(BaseModel):
    """Extensible metadata for AI, affiliate, wallet sync, etc."""

    engine_version: str = "2.1.0"
    providers_queried: int = 0
    owned_cards_filter: bool = False
    ai_enabled: bool = False
    cache_hit: bool = False


class RecommendationResponse(BaseModel):
    store_name: str
    store_category: str = ""
    as_of_date: date
    best_card: RecommendationMatch | None = None
    all_matches: list[RecommendationMatch] = Field(default_factory=list)
    provider_sources: list[ProviderSource] = Field(default_factory=list)
    meta: RecommendationMeta = Field(default_factory=RecommendationMeta)
