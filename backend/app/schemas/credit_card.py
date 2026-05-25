from pydantic import BaseModel, ConfigDict, Field


class CreditCardRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_name: str = Field(..., examples=["Chase Freedom Flex"])
    issuer: str = Field(..., examples=["Chase"])
