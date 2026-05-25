"""Persisted normalized offers from cashback providers."""

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RewardType


class StoreOffer(Base):
    __tablename__ = "store_offers"
    __table_args__ = (
        Index("ix_store_offers_store_provider", "store_id", "provider_id"),
        Index("ix_store_offers_active", "store_id", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    provider_id: Mapped[int] = mapped_column(
        ForeignKey("providers.id", ondelete="CASCADE"), nullable=False
    )
    card_id: Mapped[int | None] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True
    )
    card_name: Mapped[str] = mapped_column(String(256), nullable=False)
    issuer: Mapped[str] = mapped_column(String(128), nullable=False, default="Unknown")
    cashback_percent: Mapped[float] = mapped_column(Float, nullable=False)
    reward_type: Mapped[RewardType] = mapped_column(
        Enum(RewardType, name="reward_type_enum", native_enum=False),
        nullable=False,
        default=RewardType.STATIC,
    )
    annual_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    signup_bonus: Mapped[str | None] = mapped_column(String(512), nullable=True)
    network: Mapped[str | None] = mapped_column(String(64), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    external_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    raw_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    store: Mapped["Store"] = relationship("Store", back_populates="offers")
    provider: Mapped["Provider"] = relationship("Provider", back_populates="offers")
    card: Mapped["CreditCard | None"] = relationship("CreditCard")


class StoreProviderSync(Base):
    """Per-store refresh timestamps and status from each provider."""

    __tablename__ = "store_provider_sync"
    __table_args__ = (Index("ix_store_provider_sync_unique", "store_id", "provider_id", unique=True),)

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    provider_id: Mapped[int] = mapped_column(
        ForeignKey("providers.id", ondelete="CASCADE"), nullable=False
    )
    last_refreshed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="pending")
    offer_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    store: Mapped["Store"] = relationship("Store", back_populates="provider_syncs")
    provider: Mapped["Provider"] = relationship("Provider", back_populates="sync_logs")
