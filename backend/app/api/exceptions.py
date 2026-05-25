"""
Custom HTTP exceptions and global exception handlers.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def _log_exception(
    request: Request,
    exc: BaseException,
    *,
    prefix: str,
    level: int = logging.ERROR,
) -> None:
    """Write a full traceback to logs (stdout on Render)."""
    logger.log(
        level,
        "%s %s %s [%s]: %s",
        prefix,
        request.method,
        request.url.path,
        type(exc).__name__,
        exc,
        exc_info=exc,
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        if exc.status_code >= 500:
            _log_exception(request, exc, prefix="HTTP server error")
        else:
            logger.warning(
                "HTTP %s: %s %s — %s",
                exc.status_code,
                request.method,
                request.url.path,
                exc.detail,
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        logger.warning(
            "Validation error on %s %s: %s",
            request.method,
            request.url.path,
            exc.errors(),
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(
        request: Request, exc: SQLAlchemyError
    ) -> JSONResponse:
        _log_exception(request, exc, prefix="Database error")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Database error"},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        _log_exception(request, exc, prefix="Unhandled API error")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
