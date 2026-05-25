"""
FastAPI application entry point.

Local:
  uvicorn app.main:app --reload --port 8000

Production (Render):
  ./scripts/start.sh
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.exceptions import register_exception_handlers
from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.crud import provider as provider_crud
from app.db.session import SessionLocal
from app.jobs.scheduler import start_scheduler, stop_scheduler

logger = logging.getLogger(__name__)
API_VERSION = "2.1.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    settings = get_settings()
    logger.info(
        "Starting %s env=%s version=%s",
        settings.app_name,
        settings.app_env,
        API_VERSION,
    )
    logger.info("Database host: %s", _safe_db_host(settings.database_url))
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection OK at startup")
    except Exception:
        logger.exception("Database connection failed at startup")
        if settings.is_production:
            raise

    if settings.expiration_job_enabled or settings.offer_refresh_job_enabled:
        start_scheduler()
    yield
    stop_scheduler()
    logger.info("Shutting down %s", settings.app_name)


def _safe_db_host(database_url: str) -> str:
    if "@" in database_url:
        return database_url.split("@", 1)[-1]
    return "***"


def _health_payload(include_details: bool = True) -> dict:
    settings = get_settings()
    db_ok = False
    providers: list[dict] = []

    if include_details:
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db_ok = True
            try:
                provider_crud.upsert_default_providers(db)
                for p in provider_crud.get_providers(db, enabled_only=False):
                    providers.append(
                        {
                            "slug": p.slug,
                            "display_name": p.display_name,
                            "enabled": p.is_enabled,
                            "last_sync_at": (
                                p.last_sync_at.isoformat() if p.last_sync_at else None
                            ),
                        }
                    )
            except Exception:
                logger.debug("Provider metadata skipped in health check", exc_info=True)
            db.close()
        except Exception:
            logger.debug("Database health check failed", exc_info=True)
    else:
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db_ok = True
            db.close()
        except Exception:
            db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "version": API_VERSION,
        "environment": settings.app_env,
        "database": "connected" if db_ok else "unavailable",
        "providers": providers if include_details else [],
        "jobs": {
            "expiration_enabled": settings.expiration_job_enabled,
            "offer_refresh_enabled": settings.offer_refresh_job_enabled,
            "offer_refresh_hours": settings.offer_refresh_interval_hours,
        },
    }


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="Fintech rewards API — best credit card recommendations by store",
        version=API_VERSION,
        lifespan=lifespan,
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url="/redoc" if settings.docs_enabled else None,
        openapi_url="/openapi.json" if settings.docs_enabled else None,
    )

    if settings.allowed_host_list != ["*"]:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_host_list)

    cors_kwargs: dict = {
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if settings.cors_origin_regex:
        cors_kwargs["allow_origin_regex"] = settings.cors_origin_regex
        cors_kwargs["allow_origins"] = settings.cors_origin_list or []
    else:
        cors_kwargs["allow_origins"] = settings.cors_origin_list

    app.add_middleware(CORSMiddleware, **cors_kwargs)

    register_exception_handlers(app)
    app.include_router(api_router)

    @app.middleware("http")
    async def log_requests(request, call_next):
        path = request.url.path
        if path.startswith("/health") or path in ("/recommendations",):
            logger.info("%s %s", request.method, path)
        try:
            response = await call_next(request)
            if path == "/recommendations":
                logger.info(
                    "POST /recommendations status=%s",
                    response.status_code,
                )
            return response
        except Exception:
            logger.exception("Request failed: %s %s", request.method, path)
            raise

    @app.get("/health", tags=["health"])
    def health_check() -> dict:
        return _health_payload(include_details=True)

    @app.get("/health/live", tags=["health"])
    def health_live() -> dict:
        return {"status": "ok", "version": API_VERSION}

    @app.get("/health/ready", tags=["health"])
    def health_ready() -> dict:
        body = _health_payload(include_details=False)
        if body["database"] != "connected":
            from fastapi import HTTPException

            raise HTTPException(status_code=503, detail=body)
        return body

    return app


app = create_app()
