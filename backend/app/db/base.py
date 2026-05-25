"""
SQLAlchemy declarative base and model imports for Alembic autogenerate.

Import all models here so Alembic can detect schema changes.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so Alembic sees them (after Base is defined)
from app.models import credit_card, provider, reward, store, store_offer, user  # noqa: E402, F401
