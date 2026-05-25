"""Add providers, store_offers, and store_provider_sync tables."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_PROVIDERS = [
    ("database", "Rewards Catalog", "DATABASE", True, 10, None),
    ("cached", "Cached Offers", "CACHED", True, 20, None),
    ("ai", "AI Recommendations", "AI", False, 5, "OPENAI_API_KEY"),
    ("affiliate", "Affiliate Network", "AFFILIATE", False, 50, "AFFILIATE_API_KEY"),
    ("plaid", "Plaid Wallet", "PLAID", False, 60, "PLAID_CLIENT_ID"),
    ("stripe_fc", "Stripe Financial Connections", "STRIPE", False, 70, "STRIPE_SECRET_KEY"),
]


def upgrade() -> None:
    op.create_table(
        "providers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(64), nullable=False),
        sa.Column("display_name", sa.String(128), nullable=False),
        sa.Column("provider_type", sa.String(32), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("api_key_env", sa.String(128), nullable=True),
        sa.Column("config_json", sa.Text(), nullable=True),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_providers_slug", "providers", ["slug"], unique=True)

    op.create_table(
        "store_offers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider_id", sa.Integer(), sa.ForeignKey("providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("card_id", sa.Integer(), sa.ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True),
        sa.Column("card_name", sa.String(256), nullable=False),
        sa.Column("issuer", sa.String(128), nullable=False, server_default="Unknown"),
        sa.Column("cashback_percent", sa.Float(), nullable=False),
        sa.Column("reward_type", sa.String(32), nullable=False, server_default="STATIC"),
        sa.Column("annual_fee", sa.Float(), nullable=True),
        sa.Column("signup_bonus", sa.String(512), nullable=True),
        sa.Column("network", sa.String(64), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("external_id", sa.String(256), nullable=True),
        sa.Column("raw_payload", sa.Text(), nullable=True),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_store_offers_store_provider", "store_offers", ["store_id", "provider_id"])
    op.create_index("ix_store_offers_active", "store_offers", ["store_id", "is_active"])

    op.create_table(
        "store_provider_sync",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider_id", sa.Integer(), sa.ForeignKey("providers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("last_refreshed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("offer_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text(), nullable=True),
    )
    op.create_index(
        "ix_store_provider_sync_unique",
        "store_provider_sync",
        ["store_id", "provider_id"],
        unique=True,
    )

    providers_table = sa.table(
        "providers",
        sa.column("slug", sa.String),
        sa.column("display_name", sa.String),
        sa.column("provider_type", sa.String),
        sa.column("is_enabled", sa.Boolean),
        sa.column("priority", sa.Integer),
        sa.column("api_key_env", sa.String),
    )
    op.bulk_insert(
        providers_table,
        [
            {
                "slug": slug,
                "display_name": name,
                "provider_type": ptype,
                "is_enabled": enabled,
                "priority": priority,
                "api_key_env": env_key,
            }
            for slug, name, ptype, enabled, priority, env_key in DEFAULT_PROVIDERS
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_store_provider_sync_unique", table_name="store_provider_sync")
    op.drop_table("store_provider_sync")
    op.drop_index("ix_store_offers_active", table_name="store_offers")
    op.drop_index("ix_store_offers_store_provider", table_name="store_offers")
    op.drop_table("store_offers")
    op.drop_index("ix_providers_slug", table_name="providers")
    op.drop_table("providers")
