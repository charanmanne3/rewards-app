"""Category-based card recommendations."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.category_recommend import CategoryRecommendItem
from app.services.category_recommend import get_recommendations_by_category

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recommendations"])


@router.get("/recommend", response_model=list[CategoryRecommendItem])
def recommend_cards_by_category(
    category: str = Query(
        ...,
        min_length=1,
        max_length=120,
        description='Match against store reward categories (e.g. "dining", "grocery")',
        examples=["dining"],
    ),
    db: Session = Depends(get_db),
) -> list[CategoryRecommendItem]:
    """
    List credit cards ranked by strongest reward mappings in stores matching the category.

    The `category` parameter is matched as a substring, case-insensitive, against each
    store's catalog category field (see GET /stores).
    """
    try:
        trimmed = category.strip()
        if not trimmed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="category must not be empty",
            )

        logger.info("GET /recommend category=%r", trimmed)
        result = get_recommendations_by_category(db, trimmed)
        logger.info(
            "GET /recommend category=%r matched_cards=%s",
            trimmed,
            len(result),
        )
        return result
    except HTTPException:
        raise
    except SQLAlchemyError:
        logger.exception("GET /recommend database query failed category=%r", category)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database temporarily unavailable",
        ) from None
    except Exception as exc:
        logger.exception("GET /recommend unexpected error category=%r", category)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
