from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session, joinedload
from models.table import Table
from models.order import Order, OrderItem
from models.order_history import OrderHistory, OrderHistoryItem


def move_to_history(db: Session, table_id: int, session_id: str) -> None:
    """현재 세션의 모든 주문을 OrderHistory로 이동 (원자적 트랜잭션)"""
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.table_id == table_id, Order.session_id == session_id)
        .all()
    )
    completed_at = datetime.now(timezone.utc)
    try:
        for order in orders:
            history = OrderHistory(
                order_number=order.order_number,
                table_id=order.table_id,
                session_id=order.session_id,
                status=order.status,
                total_amount=order.total_amount,
                ordered_at=order.created_at,
                completed_at=completed_at,
            )
            db.add(history)
            db.flush()  # history.id 확보

            for item in order.items:
                db.add(OrderHistoryItem(
                    order_history_id=history.id,
                    menu_name=item.menu_name,
                    unit_price=item.unit_price,
                    quantity=item.quantity,
                ))

            db.delete(order)  # cascade로 OrderItem도 삭제

        db.commit()
    except Exception:
        db.rollback()
        raise


def get_history_by_table(db: Session, store_id_int: int, table_id: int) -> List[OrderHistory]:
    table = db.query(Table).filter(Table.id == table_id, Table.store_id == store_id_int).first()
    if not table:
        return []
    return (
        db.query(OrderHistory)
        .options(joinedload(OrderHistory.items))
        .filter(OrderHistory.table_id == table_id)
        .order_by(OrderHistory.completed_at.desc())
        .all()
    )


def get_history_by_store(db: Session, store_id_int: int) -> List[OrderHistory]:
    table_ids = [t.id for t in db.query(Table).filter(Table.store_id == store_id_int).all()]
    return (
        db.query(OrderHistory)
        .options(joinedload(OrderHistory.items))
        .filter(OrderHistory.table_id.in_(table_ids))
        .order_by(OrderHistory.completed_at.desc())
        .all()
    )
