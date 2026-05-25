from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import store as store_crud
from app.schemas.store import StoreRead

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("", response_model=list[StoreRead])
def list_stores(db: Session = Depends(get_db)) -> list[StoreRead]:
    """Return all retail stores."""
    return store_crud.get_stores(db)
