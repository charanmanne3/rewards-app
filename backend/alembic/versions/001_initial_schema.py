"""Initial schema: stores, credit_cards, rewards, users

Revision ID: 001
Revises:
Create Date: 2026-05-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stores",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_stores_id"), "stores", ["id"], unique=False)
    op.create_index(op.f("ix_stores_name"), "stores", ["name"], unique=True)

    op.create_table(
        "credit_cards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("card_name", sa.String(length=120), nullable=False),
        sa.Column("issuer", sa.String(length=80), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_credit_cards_id"), "credit_cards", ["id"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "rewards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("store_id", sa.Integer(), nullable=False),
        sa.Column("card_id", sa.Integer(), nullable=False),
        sa.Column("cashback_percent", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["card_id"], ["credit_cards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("store_id", "card_id", name="uq_store_card"),
    )
    op.create_index(op.f("ix_rewards_id"), "rewards", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_rewards_id"), table_name="rewards")
    op.drop_table("rewards")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_index(op.f("ix_credit_cards_id"), table_name="credit_cards")
    op.drop_table("credit_cards")
    op.drop_index(op.f("ix_stores_name"), table_name="stores")
    op.drop_index(op.f("ix_stores_id"), table_name="stores")
    op.drop_table("stores")
