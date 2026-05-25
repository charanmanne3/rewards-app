import logging
import sys
import traceback

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import credit_card as card_crud
from app.crud import reward as reward_crud
from app.schemas.catalog import CardRewardSummary, CreditCardDetailRead
from app.schemas.credit_card import CreditCardRead
from app.schemas.store_cards import StoreCardsResponse
from app.services.store_cards import get_store_cards

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cards", tags=["cards"])


def _flush_logs() -> None:
    for handler in logging.root.handlers:
        flush = getattr(handler, "flush", None)
        if callable(flush):
            handler.flush()
    sys.stdout.flush()
    sys.stderr.flush()


def _log_db_exception(context: str, exc: Exception) -> None:
    logger.error(
        "%s | exc_type=%s | message=%s | traceback=%s",
        context,
        type(exc).__name__,
        exc,
        traceback.format_exc(),
    )
    _flush_logs()


def _raise_http_database_error(context: str, exc: Exception) -> None:
    _log_db_exception(context, exc)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=str(exc),
    ) from exc


@router.get("", response_model=list[CreditCardRead])
def list_cards(db: Session = Depends(get_db)) -> list[CreditCardRead]:
    """Return all credit cards."""
    logger.info("[DEBUG] GET /cards: route start")
    try:
        logger.info("[DEBUG] GET /cards: before get_cards")
        cards = card_crud.get_cards(db)
        logger.info("[DEBUG] GET /cards: after get_cards count=%s", len(cards))

        logger.info("[DEBUG] GET /cards: before CreditCardRead.model_validate")
        result = [CreditCardRead.model_validate(c) for c in cards]
        logger.info(
            "[DEBUG] GET /cards: after CreditCardRead.model_validate count=%s",
            len(result),
        )
        _flush_logs()
        return result
    except HTTPException:
        raise
    except Exception as exc:
        _raise_http_database_error("GET /cards failed", exc)


@router.get("/details", response_model=list[CreditCardDetailRead])
def list_cards_with_rewards(db: Session = Depends(get_db)) -> list[CreditCardDetailRead]:
    """All credit cards with their active, eligible reward mappings."""
    logger.info("[DEBUG] GET /cards/details: route start")
    try:
        logger.info("[DEBUG] GET /cards/details: before get_cards")
        cards = card_crud.get_cards(db)
        logger.info("[DEBUG] GET /cards/details: after get_cards count=%s", len(cards))

        logger.info("[DEBUG] GET /cards/details: before get_eligible_rewards")
        eligible = reward_crud.get_eligible_rewards(db)
        logger.info(
            "[DEBUG] GET /cards/details: after get_eligible_rewards count=%s",
            len(eligible),
        )

        by_card: dict[int, list[CardRewardSummary]] = {}
        for r in eligible:
            if not r.store or not r.card:
                continue
            by_card.setdefault(r.card_id, []).append(
                CardRewardSummary(
                    store_name=r.store.name,
                    store_category=r.store.category,
                    cashback_percent=r.cashback_percent,
                    reward_type=r.reward_type,
                )
            )

        logger.info("[DEBUG] GET /cards/details: before response build")
        response = [
            CreditCardDetailRead(
                id=c.id,
                card_name=c.card_name,
                issuer=c.issuer,
                rewards=sorted(
                    by_card.get(c.id, []),
                    key=lambda x: x.cashback_percent,
                    reverse=True,
                ),
            )
            for c in cards
        ]
        logger.info(
            "[DEBUG] GET /cards/details: after response build count=%s",
            len(response),
        )
        _flush_logs()
        return response
    except HTTPException:
        raise
    except Exception as exc:
        _raise_http_database_error("GET /cards/details failed", exc)


@router.get("/{store_name}", response_model=StoreCardsResponse)
def cards_for_store(
    store_name: str,
    db: Session = Depends(get_db),
) -> StoreCardsResponse:
    """
    All matching credit cards for a store, sorted by cashback descending.

    Returns cards=[] (never 500) when store is unknown or no active rewards exist.
    """
    try:
        return get_store_cards(db, store_name)
    except Exception:
        logger.exception("Unexpected error in cards_for_store store_name=%s", store_name)
        _flush_logs()
        from app.services.reward_eligibility import utc_today

        return StoreCardsResponse(
            store_name=store_name,
            store_category="",
            as_of_date=utc_today(),
            cards=[],
        )
