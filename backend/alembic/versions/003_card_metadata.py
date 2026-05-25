"""Add card metadata: annual_fee, signup_bonus, network

Revision ID: 003
Revises: 002
Create Date: 2026-05-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# card_name -> (annual_fee, signup_bonus, network)
CARD_METADATA = [
    ("Chase Freedom Flex", 0, "$200 after $500 spend", "Visa"),
    ("Discover IT", 0, "Cashback Match year 1", "Discover"),
    ("Citi Double Cash", 0, None, "Mastercard"),
    ("Amex Gold", 250, "60,000 Membership Rewards", "Amex"),
    ("Capital One Venture X", 395, "75,000 miles", "Visa"),
    ("Amex Blue Cash Preferred", 95, "$250 statement credit", "Amex"),
    ("Apple Card", 0, "Daily Cash", "Mastercard"),
    ("Wells Fargo Active Cash", 0, "$200 cash rewards", "Visa"),
    ("Chase Sapphire Preferred", 95, "60,000 points", "Visa"),
    ("Capital One Savor", 0, "$200 cash bonus", "Mastercard"),
]


def upgrade() -> None:
    op.add_column(
        "credit_cards",
        sa.Column("annual_fee", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "credit_cards",
        sa.Column("signup_bonus", sa.String(length=120), nullable=True),
    )
    op.add_column(
        "credit_cards",
        sa.Column("network", sa.String(length=40), nullable=True),
    )

    conn = op.get_bind()
    for card_name, annual_fee, signup_bonus, network in CARD_METADATA:
        conn.execute(
            sa.text(
                """
                UPDATE credit_cards
                SET annual_fee = :annual_fee,
                    signup_bonus = :signup_bonus,
                    network = :network
                WHERE card_name = :card_name
                """
            ),
            {
                "card_name": card_name,
                "annual_fee": annual_fee,
                "signup_bonus": signup_bonus,
                "network": network,
            },
        )


def downgrade() -> None:
    op.drop_column("credit_cards", "network")
    op.drop_column("credit_cards", "signup_bonus")
    op.drop_column("credit_cards", "annual_fee")
