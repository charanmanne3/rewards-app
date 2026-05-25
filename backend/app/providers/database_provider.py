"""Reads eligible rewards from the primary PostgreSQL rewards catalog."""

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, load_only

from app.crud import store as store_crud
from app.models.reward import Reward
from app.providers.base import CashbackProvider, NormalizedOffer, ProviderFetchResult
from app.services.card_serialization import (
    card_load_only_attrs,
    safe_annual_fee,
    safe_network,
    safe_signup_bonus,
)
from app.services.reward_eligibility import is_reward_eligible, utc_today

logger = logging.getLogger(__name__)


class DatabaseRewardProvider(CashbackProvider):
    slug = "database"
    display_name = "Rewards Catalog"
    priority = 10

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
                error_message=f"Store '{store_name}' not found",
                fetched_at=now,
            )

        if categories and store.category not in categories:
            return ProviderFetchResult(
                provider_slug=self.slug,
                display_name=self.display_name,
                status="filtered",
                fetched_at=now,
            )

        today = utc_today()
        try:
            load_attrs = card_load_only_attrs(db)
            stmt = (
                select(Reward)
                .options(joinedload(Reward.card).load_only(*load_attrs))
                .where(Reward.store_id == store.id, Reward.is_active.is_(True))
            )
            rewards = list(db.scalars(stmt).unique().all())
        except Exception as exc:
            logger.exception("DatabaseRewardProvider failed for %s", store_name)
            return ProviderFetchResult(
                provider_slug=self.slug,
                display_name=self.display_name,
                status="error",
                error_message=str(exc),
                fetched_at=now,
            )

        offers: list[NormalizedOffer] = []
        for reward in rewards:
            if not is_reward_eligible(reward, today):
                continue
            card = reward.card
            if not card:
                continue
            offers.append(
                NormalizedOffer(
                    provider_slug=self.slug,
                    store_name=store.name,
                    card_id=card.id,
                    card_name=card.card_name,
                    issuer=card.issuer or "Unknown",
                    cashback_percent=self.normalize_cashback(reward.cashback_percent),
                    reward_type=reward.reward_type,
                    annual_fee=safe_annual_fee(card),
                    signup_bonus=safe_signup_bonus(card),
                    network=safe_network(card),
                    start_date=reward.start_date,
                    end_date=reward.end_date,
                    external_id=str(reward.id),
                )
            )

        return ProviderFetchResult(
            provider_slug=self.slug,
            display_name=self.display_name,
            offers=offers,
            fetched_at=now,
            status="ok",
        )
