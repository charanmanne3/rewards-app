"""CRUD for persisted store offers and sync metadata."""

import json
from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.store_offer import StoreOffer, StoreProviderSync
from app.providers.base import NormalizedOffer


def get_active_offers_for_store(db: Session, store_id: int) -> list[StoreOffer]:
    stmt = (
        select(StoreOffer)
        .where(StoreOffer.store_id == store_id, StoreOffer.is_active.is_(True))
        .order_by(StoreOffer.cashback_percent.desc())
    )
    return list(db.scalars(stmt).all())


def replace_provider_offers(
    db: Session,
    store_id: int,
    provider_id: int,
    offers: list[NormalizedOffer],
) -> int:
    """Replace all offers for a store+provider with a fresh snapshot."""
    db.execute(
        delete(StoreOffer).where(
            StoreOffer.store_id == store_id,
            StoreOffer.provider_id == provider_id,
        )
    )
    now = datetime.now(timezone.utc)
    for offer in offers:
        db.add(
            StoreOffer(
                store_id=store_id,
                provider_id=provider_id,
                card_id=offer.card_id,
                card_name=offer.card_name,
                issuer=offer.issuer,
                cashback_percent=offer.cashback_percent,
                reward_type=offer.reward_type,
                annual_fee=offer.annual_fee,
                signup_bonus=offer.signup_bonus,
                network=offer.network,
                start_date=offer.start_date,
                end_date=offer.end_date,
                is_active=True,
                external_id=offer.external_id,
                raw_payload=json.dumps(offer.raw_payload) if offer.raw_payload else None,
                fetched_at=now,
            )
        )
    db.flush()
    return len(offers)


def upsert_sync_log(
    db: Session,
    store_id: int,
    provider_id: int,
    *,
    status: str,
    offer_count: int,
    error_message: str | None = None,
) -> StoreProviderSync:
    row = db.scalar(
        select(StoreProviderSync).where(
            StoreProviderSync.store_id == store_id,
            StoreProviderSync.provider_id == provider_id,
        )
    )
    now = datetime.now(timezone.utc)
    if row:
        row.last_refreshed_at = now
        row.status = status
        row.offer_count = offer_count
        row.error_message = error_message
    else:
        row = StoreProviderSync(
            store_id=store_id,
            provider_id=provider_id,
            last_refreshed_at=now,
            status=status,
            offer_count=offer_count,
            error_message=error_message,
        )
        db.add(row)
    db.flush()
    return row


def get_sync_logs_for_store(db: Session, store_id: int) -> list[StoreProviderSync]:
    stmt = select(StoreProviderSync).where(StoreProviderSync.store_id == store_id)
    return list(db.scalars(stmt).all())
