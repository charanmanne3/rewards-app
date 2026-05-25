from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import RewardType


class RewardBase(BaseModel):
    store_id: int
    card_id: int
    cashback_percent: float = Field(..., ge=0, le=100)
    reward_type: RewardType = RewardType.STATIC
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def validate_dates(self) -> "RewardBase":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        if self.reward_type == RewardType.ROTATING and not self.end_date:
            raise ValueError("ROTATING rewards require an end_date (quarter window)")
        return self


class RewardCreate(RewardBase):
    pass


class RewardUpdate(BaseModel):
    cashback_percent: float | None = Field(None, ge=0, le=100)
    reward_type: RewardType | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None


class RewardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    store_id: int
    card_id: int
    cashback_percent: float
    reward_type: RewardType
    start_date: date | None
    end_date: date | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    store_name: str | None = None
    card_name: str | None = None
    issuer: str | None = None
    is_currently_eligible: bool | None = None


class RewardDeactivateResponse(BaseModel):
    id: int
    is_active: bool
    message: str
