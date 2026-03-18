from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from dependencies import get_db, get_current_admin, get_current_table
from schemas.auth import AdminTokenData, TableTokenData
from schemas.order import OrderCreateRequest, OrderResponse, OrderStatusUpdateRequest
import services.order_service as order_svc
from services.table_service import get_store_or_404
from services.sse_service import SSEService

router = APIRouter()
_sse: SSEService = None  # main.py에서 주입


def set_sse_service(sse: SSEService):
    global _sse
    _sse = sse


@router.get("", response_model=List[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = get_store_or_404(db, admin.store_id)
    return order_svc.get_orders_for_admin(db, store)


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    body: OrderCreateRequest,
    db: Session = Depends(get_db),
    table: TableTokenData = Depends(get_current_table),
):
    store = get_store_or_404(db, table.store_id)
    order = order_svc.create_order(db, store, table.table_id, table.session_id, body)
    if _sse:
        await _sse.broadcast(table.store_id, {
            "type": "order.created",
            "data": {
                "order_id": order.id,
                "order_number": order.order_number,
                "table_id": order.table_id,
                "session_id": order.session_id,
                "status": order.status.value,
                "total_amount": order.total_amount,
                "items": [
                    {"menu_name": i.menu_name, "quantity": i.quantity, "unit_price": i.unit_price}
                    for i in order.items
                ],
                "created_at": order.created_at.isoformat(),
            },
        })
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    body: OrderStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = get_store_or_404(db, admin.store_id)
    order = order_svc.update_order_status(db, store, order_id, body.status)
    if _sse:
        await _sse.broadcast(admin.store_id, {
            "type": "order.status_changed",
            "data": {
                "order_id": order.id,
                "order_number": order.order_number,
                "table_id": order.table_id,
                "status": order.status.value,
            },
        })
    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: AdminTokenData = Depends(get_current_admin),
):
    store = get_store_or_404(db, admin.store_id)
    order = order_svc.delete_order(db, store, order_id)
    if _sse:
        await _sse.broadcast(admin.store_id, {
            "type": "order.deleted",
            "data": {"order_id": order_id, "table_id": order.table_id},
        })
