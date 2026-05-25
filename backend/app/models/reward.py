from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RewardType


class Reward(Base):
    """
    Store–card cashback mapping with lifecycle fields.

    Multiple rows per store+card are allowed (e.g. STATIC baseline + PROMOTIONAL boost).
    Admins update via API — no code deploys required.
    """

    __tablename__ = "rewards"
    __table_args__ = (
        Index("ix_rewards_store_active", "store_id", "is_active"),
        Index("ix_rewards_dates", "start_date", "end_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    card_id: Mapped[int] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="CASCADE"), nullable=False
    )
    cashback_percent: Mapped[float] = mapped_column(Float, nullable=False)
    reward_type: Mapped[RewardType] = mapped_column(
        Enum(RewardType, name="reward_type_enum", native_enum=False),
        nullable=False,
        default=RewardType.STATIC,
    )
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    store: Mapped["Store"] = relationship("Store", back_populates="rewards")
    card: Mapped["CreditCard"] = relationship("CreditCard", back_populates="rewards")
