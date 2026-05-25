"""
Background scheduler for maintenance and offer refresh jobs.

Jobs:
- Deactivate expired rewards (existing)
- Refresh store offers every 6 hours (DB → store_offers cache)
- Warm in-memory recommendation cache after refresh
"""

import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.services.offer_sync import refresh_all_stores, warm_provider_cache
from app.services.reward_expiration import deactivate_expired_rewards

logger = logging.getLogger(__name__)
_scheduler: BackgroundScheduler | None = None


def _run_expiration_job() -> None:
    settings = get_settings()
    if not settings.expiration_job_enabled:
        return
    db = SessionLocal()
    try:
        count = deactivate_expired_rewards(db)
        if count:
            logger.info("Scheduled job deactivated %s reward(s)", count)
    except Exception:
        db.rollback()
        logger.exception("Expiration cleanup job failed")
    finally:
        db.close()


def _run_offer_refresh_job() -> None:
    settings = get_settings()
    if not settings.offer_refresh_job_enabled:
        return
    db = SessionLocal()
    try:
        stats = refresh_all_stores(db)
        logger.info(
            "Offer refresh complete: %s stores, %s offers",
            stats.get("stores", 0),
            stats.get("offers", 0),
        )
        if settings.cache_warm_job_enabled:
            warm_provider_cache(db)
    except Exception:
        db.rollback()
        logger.exception("Offer refresh job failed")
    finally:
        db.close()


def start_scheduler() -> BackgroundScheduler | None:
    global _scheduler
    settings = get_settings()
    if not settings.expiration_job_enabled and not settings.offer_refresh_job_enabled:
        logger.info("All schedulers disabled")
        return None
    if _scheduler is not None:
        return _scheduler

    _scheduler = BackgroundScheduler()

    if settings.expiration_job_enabled:
        _scheduler.add_job(
            _run_expiration_job,
            trigger=IntervalTrigger(minutes=settings.expiration_job_interval_minutes),
            id="deactivate_expired_rewards",
            replace_existing=True,
        )

    if settings.offer_refresh_job_enabled:
        _scheduler.add_job(
            _run_offer_refresh_job,
            trigger=IntervalTrigger(hours=settings.offer_refresh_interval_hours),
            id="refresh_store_offers",
            replace_existing=True,
        )

    _scheduler.start()
    logger.info(
        "Scheduler started (expiration=%s min, offer_refresh=%s h)",
        settings.expiration_job_interval_minutes,
        settings.offer_refresh_interval_hours,
    )
    return _scheduler


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Stopped scheduler")
