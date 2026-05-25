from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    card_name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    issuer: Mapped[str] = mapped_column(String(80), nullable=False)
    annual_fee: Mapped[float | None] = mapped_column(Float, nullable=True, default=0.0)
    signup_bonus: Mapped[str | None] = mapped_column(String(120), nullable=True)
    network: Mapped[str | None] = mapped_column(String(40), nullable=True)

    rewards: Mapped[list["Reward"]] = relationship("Reward", back_populates="card")
