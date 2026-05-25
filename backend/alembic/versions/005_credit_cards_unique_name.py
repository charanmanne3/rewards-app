"""Add unique index on credit_cards.card_name (matches ORM model).

Revision ID: 005
Revises: 004
Create Date: 2026-05-25

"""

from typing import Sequence, Union

from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        op.f("ix_credit_cards_card_name"),
        "credit_cards",
        ["card_name"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_credit_cards_card_name"), table_name="credit_cards")
