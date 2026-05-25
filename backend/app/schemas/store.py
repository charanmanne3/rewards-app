from pydantic import BaseModel, ConfigDict, Field


class StoreRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str = Field(..., examples=["Walmart"])
    category: str = Field(..., examples=["Grocery"])
