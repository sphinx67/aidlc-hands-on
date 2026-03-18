from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_admin
from schemas.auth import AdminTokenData
from schemas.order_history import OrderHistoryResponse
from services.table_service import get_store_or_404
import services.order_history_service as history_svc

router = APIRouter()


@router.get("", response_model=List[OrderHistoryResponse])
def list_order_history(
    table_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = get_store_or_404(db, admin.store_id)
    if table_id is not None:
        return history_svc.get_history_by_table(db, store.id, table_id)
    return history_svc.get_history_by_store(db, store.id)
