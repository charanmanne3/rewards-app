"""CRUD for provider metadata."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.provider import Provider, ProviderType


def get_providers(db: Session, enabled_only: bool = True) -> list[Provider]:
    stmt = select(Provider).order_by(Provider.priority)
    if enabled_only:
        stmt = stmt.where(Provider.is_enabled.is_(True))
    return list(db.scalars(stmt).all())


def get_provider_by_slug(db: Session, slug: str) -> Provider | None:
    return db.scalar(select(Provider).where(Provider.slug == slug))


def upsert_default_providers(db: Session) -> None:
    defaults = [
        ("database", "Rewards Catalog", ProviderType.DATABASE, 10, None),
        ("cached", "Cached Offers", ProviderType.CACHED, 20, None),
        ("ai", "AI Recommendations", ProviderType.AI, 5, "OPENAI_API_KEY"),
        ("affiliate", "Affiliate Network", ProviderType.AFFILIATE, 50, "AFFILIATE_API_KEY"),
        ("plaid", "Plaid Wallet", ProviderType.PLAID, 60, "PLAID_CLIENT_ID"),
        ("stripe_fc", "Stripe Financial Connections", ProviderType.STRIPE, 70, "STRIPE_SECRET_KEY"),
    ]
    for slug, name, ptype, priority, env_key in defaults:
        existing = get_provider_by_slug(db, slug)
        if existing:
            continue
        db.add(
            Provider(
                slug=slug,
                display_name=name,
                provider_type=ptype,
                is_enabled=slug in ("database", "cached"),
                priority=priority,
                api_key_env=env_key,
            )
        )
    db.commit()


def touch_provider_sync(db: Session, provider_id: int) -> None:
    provider = db.get(Provider, provider_id)
    if provider:
        provider.last_sync_at = datetime.now(timezone.utc)
        db.commit()
