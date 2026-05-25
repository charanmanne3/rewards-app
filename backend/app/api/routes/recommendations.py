from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.recommendation import BestCardRecommendation
from app.services.recommendation import get_best_cards_for_store

router = APIRouter(tags=["recommendations"])


@router.get("/best-card/{store_name}", response_model=BestCardRecommendation)
def best_card_for_store(
    store_name: str,
    db: Session = Depends(get_db),
) -> BestCardRecommendation:
    """
    Recommend the best credit card(s) for a store by cashback percentage.

    Store name is case-insensitive (e.g. walmart, Walmart).
    """
    result = get_best_cards_for_store(db, store_name)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store '{store_name}' not found",
        )
    if not result.best_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No reward mappings found for store '{store_name}'",
        )
    return result
