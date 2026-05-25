"""
Standalone expiration cleanup — for cron, Render cron job, or AWS Lambda.

Usage:
  python -m scripts.run_expiration_cleanup
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.logging import setup_logging
from app.db.session import SessionLocal
from app.services.reward_expiration import deactivate_expired_rewards


def main() -> int:
    setup_logging()
    db = SessionLocal()
    try:
        count = deactivate_expired_rewards(db)
        print(f"Deactivated {count} expired reward(s)")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
