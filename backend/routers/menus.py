from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from dependencies import get_db
from schemas.menu import CategoryResponse, MenuResponse
from models.store import Store
import services.menu_service as menu_svc

router = APIRouter()


def _get_store(store_id: str, db: Session) -> Store:
    from services.table_service import get_store_or_404
    return get_store_or_404(db, store_id)


@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(store_id: str = Query(...), db: Session = Depends(get_db)):
    store = _get_store(store_id, db)
    return menu_svc.get_categories(db, store)


@router.get("", response_model=List[MenuResponse])
def list_menus(
    store_id: str = Query(...),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    store = _get_store(store_id, db)
    return menu_svc.get_menus(db, store, category_id)
