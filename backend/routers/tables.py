from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_admin
from schemas.auth import AdminTokenData
from schemas.table import TableCreate, TableSetupRequest, TableAuthRequest, TableAuthResponse, TableResponse
import services.table_service as table_svc
import services.order_history_service as history_svc
from services.sse_service import SSEService

router = APIRouter()
_sse: SSEService = None


def set_sse_service(sse: SSEService):
    global _sse
    _sse = sse


@router.get("", response_model=List[TableResponse])
def list_tables(
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = table_svc.get_store_or_404(db, admin.store_id)
    tables = table_svc.get_tables(db, store)
    return [
        TableResponse(
            id=t.id,
            table_number=t.table_number,
            current_session_id=t.current_session_id,
            is_active=t.is_active,
            has_password=t.password_hash is not None,
            created_at=t.created_at,
        )
        for t in tables
    ]


@router.post("", response_model=TableResponse, status_code=201)
def create_table(
    body: TableCreate,
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = table_svc.get_store_or_404(db, admin.store_id)
    t = table_svc.create_table(db, store, body.table_number)
    return TableResponse(
        id=t.id,
        table_number=t.table_number,
        current_session_id=t.current_session_id,
        is_active=t.is_active,
        has_password=t.password_hash is not None,
        created_at=t.created_at,
    )


@router.post("/{table_id}/setup", response_model=TableResponse)
def setup_table(
    table_id: int,
    body: TableSetupRequest,
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = table_svc.get_store_or_404(db, admin.store_id)
    t = table_svc.setup_table_password(db, store, table_id, body.password)
    return TableResponse(
        id=t.id,
        table_number=t.table_number,
        current_session_id=t.current_session_id,
        is_active=t.is_active,
        has_password=t.password_hash is not None,
        created_at=t.created_at,
    )


@router.post("/auth", response_model=TableAuthResponse)
def table_auth(body: TableAuthRequest, db: Session = Depends(get_db)):
    return table_svc.authenticate_table(db, body.store_id, body.table_number, body.password)


@router.post("/{table_id}/complete", status_code=204)
async def complete_session(
    table_id: int,
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = table_svc.get_store_or_404(db, admin.store_id)
    table = table_svc.complete_session(db, store, table_id)
    session_id = table.current_session_id

    # 주문 이력으로 이동
    history_svc.move_to_history(db, table_id, session_id)

    # 세션 초기화
    table.current_session_id = None
    db.commit()

    if _sse:
        await _sse.broadcast(admin.store_id, {
            "type": "session.completed",
            "data": {"table_id": table_id, "table_number": table.table_number},
        })
