"""Add reward lifecycle fields (type, dates, is_active, timestamps)

Revision ID: 002
Revises: 001
Create Date: 2026-05-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Allow multiple rewards per store+card (rotating vs static, etc.)
    op.drop_constraint("uq_store_card", "rewards", type_="unique")

    op.add_column(
        "rewards",
        sa.Column("reward_type", sa.String(length=20), nullable=False, server_default="STATIC"),
    )
    op.add_column("rewards", sa.Column("start_date", sa.Date(), nullable=True))
    op.add_column("rewards", sa.Column("end_date", sa.Date(), nullable=True))
    op.add_column(
        "rewards",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.add_column(
        "rewards",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.add_column(
        "rewards",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_rewards_store_active", "rewards", ["store_id", "is_active"], unique=False)
    op.create_index("ix_rewards_dates", "rewards", ["start_date", "end_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_rewards_dates", table_name="rewards")
    op.drop_index("ix_rewards_store_active", table_name="rewards")
    op.drop_column("rewards", "updated_at")
    op.drop_column("rewards", "created_at")
    op.drop_column("rewards", "is_active")
    op.drop_column("rewards", "end_date")
    op.drop_column("rewards", "start_date")
    op.drop_column("rewards", "reward_type")
    op.create_unique_constraint("uq_store_card", "rewards", ["store_id", "card_id"])
