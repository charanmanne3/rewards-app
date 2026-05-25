from datetime import date

from pydantic import BaseModel, Field, field_validator

from app.models.enums import RewardType


class StoreCardMatch(BaseModel):
    card_id: int
    card_name: str = "Unknown card"
    issuer: str = "Unknown"
    cashback_percent: float = Field(default=0, ge=0)
    reward_type: RewardType = RewardType.STATIC
    annual_fee: float | None = Field(default=0, ge=0)
    expires_at: date | None = None
    signup_bonus: str | None = None
    network: str | None = None

    @field_validator("annual_fee", mode="before")
    @classmethod
    def coerce_annual_fee(cls, value: object) -> float:
        if value is None:
            return 0.0
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    @field_validator("cashback_percent", mode="before")
    @classmethod
    def coerce_cashback(cls, value: object) -> float:
        if value is None:
            return 0.0
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0


class StoreCardsResponse(BaseModel):
    store_name: str
    store_category: str = ""
    as_of_date: date
    cards: list[StoreCardMatch] = Field(default_factory=list)
