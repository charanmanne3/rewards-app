from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False)

    rewards: Mapped[list["Reward"]] = relationship("Reward", back_populates="store")
    offers: Mapped[list["StoreOffer"]] = relationship("StoreOffer", back_populates="store")
    provider_syncs: Mapped[list["StoreProviderSync"]] = relationship(
        "StoreProviderSync", back_populates="store"
    )
