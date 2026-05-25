"""Shared FastAPI dependencies."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db

DbSession = Annotated[Session, Depends(get_db)]


def get_pagination(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> tuple[int, int]:
    return page, page_size


Pagination = Annotated[tuple[int, int], Depends(get_pagination)]


def verify_admin_api_key(
    x_admin_api_key: str | None = Header(None, alias="X-Admin-API-Key"),
) -> None:
    """
    Protect admin routes with a shared secret (set ADMIN_API_KEY in .env).

    Future: replace with JWT + role claims for multi-admin audit trails.
    """
    settings = get_settings()
    if not settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API is disabled (ADMIN_API_KEY not configured)",
        )
    if x_admin_api_key != settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin API key",
        )


AdminAuth = Annotated[None, Depends(verify_admin_api_key)]
