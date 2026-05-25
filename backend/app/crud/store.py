from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.store import Store

# Alias → canonical store name (case-insensitive lookup)
STORE_ALIASES: dict[str, str] = {
    "7 eleven": "7-Eleven",
    "7eleven": "7-Eleven",
    "711": "7-Eleven",
    "seven eleven": "7-Eleven",
    "wal-mart": "Walmart",
    "wal mart": "Walmart",
    "star bucks": "Starbucks",
    "sbux": "Starbucks",
    "bestbuy": "Best Buy",
    "homedepot": "Home Depot",
    "costco wholesale": "Costco",
}


def _normalize_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def resolve_store_name(name: str) -> str:
    """Map user input / alias to canonical store name."""
    key = _normalize_name(name)
    if key in STORE_ALIASES:
        return STORE_ALIASES[key]
    compact = key.replace(" ", "").replace("-", "")
    if compact in ("711", "7eleven"):
        return "7-Eleven"
    return name.strip()


def get_stores(db: Session, skip: int = 0, limit: int = 100) -> list[Store]:
    stmt = select(Store).order_by(Store.name).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_store_by_name(db: Session, name: str) -> Store | None:
    canonical = resolve_store_name(name)
    stmt = select(Store).where(Store.name.ilike(canonical))
    found = db.scalars(stmt).first()
    if found:
        return found
    # Fallback: partial match on original input
    stmt = select(Store).where(Store.name.ilike(name.strip()))
    return db.scalars(stmt).first()
