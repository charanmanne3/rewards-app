"""
Reward eligibility rules — single source of truth for "is this reward live?"

Used by recommendation engine, admin list filters, and expiration jobs.
Future: plug in timezone rules, issuer blackout dates, or scraped validity windows.
"""

from datetime import date, datetime, timezone

from app.models.reward import Reward


def utc_today() -> date:
    return datetime.now(timezone.utc).date()


def is_within_date_window(
    start_date: date | None,
    end_date: date | None,
    as_of: date | None = None,
) -> bool:
    today = as_of or utc_today()
    if start_date and today < start_date:
        return False
    if end_date and today > end_date:
        return False
    return True


def is_reward_eligible(reward: Reward, as_of: date | None = None) -> bool:
    """Reward counts toward recommendations when active and within its date window."""
    if not reward.is_active:
        return False
    return is_within_date_window(reward.start_date, reward.end_date, as_of)


def should_auto_deactivate(reward: Reward, as_of: date | None = None) -> bool:
    """Past end_date rewards are marked inactive by the cleanup job."""
    if not reward.is_active or reward.end_date is None:
        return False
    today = as_of or utc_today()
    return today > reward.end_date
