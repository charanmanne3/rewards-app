"""Provider metadata for multi-source cashback aggregation."""

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProviderType(str, Enum):
    DATABASE = "database"
    CACHED = "cached"
    AFFILIATE = "affiliate"
    PLAID = "plaid"
    STRIPE = "stripe"
    AI = "ai"


class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    provider_type: Mapped[ProviderType] = mapped_column(
        SAEnum(ProviderType, name="provider_type_enum", native_enum=False),
        nullable=False,
    )
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    api_key_env: Mapped[str | None] = mapped_column(String(128), nullable=True)
    config_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    offers: Mapped[list["StoreOffer"]] = relationship("StoreOffer", back_populates="provider")
    sync_logs: Mapped[list["StoreProviderSync"]] = relationship(
        "StoreProviderSync", back_populates="provider"
    )
