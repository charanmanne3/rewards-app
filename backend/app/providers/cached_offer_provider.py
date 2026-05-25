"""Reads persisted normalized offers from store_offers table."""

import json
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.crud import provider as provider_crud
from app.crud import store as store_crud
from app.models.store_offer import StoreOffer
from app.providers.base import CashbackProvider, NormalizedOffer, ProviderFetchResult
from app.services.reward_eligibility import utc_today

logger = logging.getLogger(__name__)


class CachedOfferProvider(CashbackProvider):
    slug = "cached"
    display_name = "Cached Offers"
    priority = 20

    def fetch_offers(
        self,
        db: Session,
        store_name: str,
        categories: list[str] | None = None,
    ) -> ProviderFetchResult:
        now = datetime.now(timezone.utc)
        store = store_crud.get_store_by_name(db, store_name)
        if not store:
            return ProviderFetchResult(
                provider_slug=self.slug,
                display_name=self.display_name,
                status="not_found",
                fetched_at=now,
            )

        provider_row = provider_crud.get_provider_by_slug(db, self.slug)
        if not provider_row or not provider_row.is_enabled:
            return ProviderFetchResult(
                provider_slug=self.slug,
                display_name=self.display_name,
                status="disabled",
                fetched_at=now,
            )

        today = utc_today()
        stmt = (
            select(StoreOffer)
            .options(joinedload(StoreOffer.provider))
            .where(
                StoreOffer.store_id == store.id,
                StoreOffer.provider_id == provider_row.id,
                StoreOffer.is_active.is_(True),
            )
        )
        rows = list(db.scalars(stmt).all())
        offers: list[NormalizedOffer] = []
        for row in rows:
            if row.end_date and row.end_date < today:
                continue
            if row.start_date and row.start_date > today:
                continue
            raw = None
            if row.raw_payload:
                try:
                    raw = json.loads(row.raw_payload)
                except json.JSONDecodeError:
                    raw = None
            offers.append(
                NormalizedOffer(
                    provider_slug=self.slug,
                    store_name=store.name,
                    card_id=row.card_id,
                    card_name=row.card_name,
                    issuer=row.issuer,
                    cashback_percent=self.normalize_cashback(row.cashback_percent),
                    reward_type=row.reward_type,
                    annual_fee=row.annual_fee,
                    signup_bonus=row.signup_bonus,
                    network=row.network,
                    start_date=row.start_date,
                    end_date=row.end_date,
                    external_id=row.external_id,
                    raw_payload=raw,
                )
            )

        return ProviderFetchResult(
            provider_slug=self.slug,
            display_name=self.display_name,
            offers=offers,
            fetched_at=now,
            status="ok" if offers else "empty",
        )
