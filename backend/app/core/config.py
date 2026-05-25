"""
Application settings loaded from environment variables.

Uses pydantic-settings so values are validated at startup.
Copy .env.example to .env for local development.
"""

from functools import lru_cache
from typing import List
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Supabase/Heroku sometimes use postgres:// — SQLAlchemy needs postgresql://."""
    u = url.strip()
    if u.startswith("postgres://"):
        u = "postgresql://" + u[len("postgres://") :]
    return u


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Rewards Recommendation API"
    app_env: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    log_format: str = "text"  # text | json (json recommended in production)

    database_url: str = ""
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_recycle_seconds: int = 1800
    db_pool_pre_ping: bool = True

    secret_key: str = ""
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"

    # Comma-separated origins — required in production (no localhost defaults)
    cors_origins: str = ""

    admin_api_key: str = ""

    recommendation_cache_ttl_seconds: int = 300
    cache_max_entries: int = 256

    expiration_job_enabled: bool = True
    expiration_job_interval_minutes: int = 60
    offer_refresh_job_enabled: bool = True
    offer_refresh_interval_hours: int = 6
    cache_warm_job_enabled: bool = True

    openai_api_key: str = ""
    affiliate_api_key: str = ""
    plaid_client_id: str = ""
    plaid_secret: str = ""
    stripe_secret_key: str = ""

    # Render / cloud
    port: int = 8000
    web_concurrency: int = 1
    allowed_hosts: str = "*"  # comma-separated; use api.yourdomain.com in production

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_db_url(cls, value: str) -> str:
        if not value:
            return ""
        return normalize_database_url(str(value))

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, value: str | List[str]) -> str:
        if isinstance(value, list):
            return ",".join(value)
        return str(value) if value else ""

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() in ("production", "prod")

    @property
    def is_development(self) -> bool:
        return not self.is_production

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.cors_origins.strip():
            return []
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def cors_origin_regex(self) -> str | None:
        """Permissive Expo/Metro origins — development only."""
        if self.is_production:
            return None
        return r"https?://.*|exp://.*"

    @property
    def allowed_host_list(self) -> List[str]:
        if self.allowed_hosts.strip() == "*":
            return ["*"]
        return [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]

    @property
    def docs_enabled(self) -> bool:
        return self.debug or self.is_development

    @model_validator(mode="after")
    def apply_development_defaults(self) -> "Settings":
        if self.is_development:
            if not self.database_url:
                object.__setattr__(
                    self,
                    "database_url",
                    "postgresql://rewards_user:rewards_pass@localhost:5432/rewards_db",
                )
            if not self.cors_origins:
                object.__setattr__(
                    self,
                    "cors_origins",
                    "http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006,"
                    "exp://localhost:8081,exp://127.0.0.1:8081",
                )
            if not self.secret_key:
                object.__setattr__(self, "secret_key", "dev-only-not-for-production")
        return self

    def validate_for_runtime(self) -> None:
        """Raise on dangerous production configuration."""
        if not self.database_url:
            raise ValueError("DATABASE_URL is required")

        if self.is_production:
            if not self.secret_key or self.secret_key == "dev-only-not-for-production":
                raise ValueError("SECRET_KEY must be set in production (openssl rand -hex 32)")
            if not self.admin_api_key:
                raise ValueError("ADMIN_API_KEY must be set in production")
            if not self.cors_origin_list:
                raise ValueError(
                    "CORS_ORIGINS must list your Expo/web origins in production"
                )
            if "localhost" in self.database_url or "127.0.0.1" in self.database_url:
                raise ValueError("DATABASE_URL must not point to localhost in production")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_for_runtime()
    return settings
