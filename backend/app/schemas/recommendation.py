from datetime import date

from pydantic import BaseModel, Field

from app.models.enums import RewardType


class CardRewardRank(BaseModel):
    card_id: int
    card_name: str
    issuer: str
    cashback_percent: float = Field(..., ge=0)
    reward_type: RewardType
    reward_id: int
    start_date: date | None = None
    end_date: date | None = None


class BestCardRecommendation(BaseModel):
    store_name: str
    store_category: str
    as_of_date: date
    best_card: CardRewardRank | None = None
    all_ranked_cards: list[CardRewardRank] = Field(default_factory=list)
