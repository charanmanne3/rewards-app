"""Unified recommendations endpoint."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.unified_recommendation import RecommendationRequest, RecommendationResponse
from app.services.unified_recommendation import get_unified_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recommendations"])


@router.post("/recommendations", response_model=RecommendationResponse)
def create_recommendations(
    body: RecommendationRequest,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    """
    Unified recommendation engine — aggregates offers from all enabled providers.

  Input:
    - store: retail store name (case-insensitive)
    - owned_cards: optional list of card names the user owns (boosts ranking)
    - categories: optional category filter

  Returns best card, all ranked matches, and provider source metadata.
    """
    logger.info(
        "Recommendation request store=%r owned_cards=%d categories=%d",
        body.store,
        len(body.owned_cards),
        len(body.categories),
    )
    try:
        result = get_unified_recommendations(
            db,
            store_name=body.store,
            owned_cards=body.owned_cards,
            categories=body.categories,
        )
    except Exception:
        logger.exception("Recommendation engine failed for store=%r", body.store)
        raise

    if not result.all_matches:
        logger.warning("No offers for store=%r", body.store)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No offers found for store '{body.store}'",
        )

    best = result.best_card.card_name if result.best_card else None
    logger.info(
        "Recommendation response store=%r matches=%d best=%r",
        result.store_name,
        len(result.all_matches),
        best,
    )
    return result
