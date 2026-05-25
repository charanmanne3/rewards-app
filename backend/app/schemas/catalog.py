from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import RewardType


class CardRewardSummary(BaseModel):
    store_name: str
    store_category: str
    cashback_percent: float = Field(..., ge=0)
    reward_type: RewardType


class CreditCardDetailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_name: str
    issuer: str
    rewards: list[CardRewardSummary] = Field(default_factory=list)


class PromotionalOfferRead(BaseModel):
    id: int
    store_name: str
    store_category: str
    card_name: str
    issuer: str
    cashback_percent: float
    start_date: date | None
    end_date: date | None
