"""
Seed stores, cards, and rewards (manual).

Usage:
  python -m scripts.seed
"""

from app.core.logging import setup_logging
from app.db.seed_data import seed_if_empty


def main() -> None:
    setup_logging()
    seed_if_empty()


if __name__ == "__main__":
    main()
