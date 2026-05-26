"""Response models for GET /recommend (category-scoped card suggestions)."""

from pydantic import BaseModel, ConfigDict, Field


class CategoryRecommendItem(BaseModel):
    """One card recommendation for stores whose category matches the query."""

    model_config = ConfigDict(from_attributes=True)

    card_name: str = Field(..., examples=["Amex Gold"])
    reward_category: str = Field(
        ...,
        description="Store/category label from the catalog (matches seed store categories)",
        examples=["Dining & Coffee"],
    )
    reward_rate: str = Field(
        ...,
        description="Dominant cashback or multiplier-style display for matched rewards",
        examples=["4x"],
    )
    annual_fee: float | None = Field(
        ...,
        examples=[250],
        description="Card annual fee in USD; None if unset in DB",
    )
