from datetime import date, datetime, timezone
from typing import List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from models.store import Store, Menu
from models.table import Table
from models.order import Order, OrderItem, OrderStatus
from schemas.order import OrderCreateRequest, OrderItemCreate


def generate_order_number(db: Session, today: date) -> str:
    prefix = f"ORD-{today.strftime('%Y%m%d')}-"
    last_order = (
        db.query(Order)
        .filter(Order.order_number.like(f"{prefix}%"))
        .order_by(Order.order_number.desc())
        .first()
    )
    seq = int(last_order.order_number.split("-")[-1]) + 1 if last_order else 1
    return f"{prefix}{seq:04d}"


def create_order(
    db: Session,
    store: Store,
    table_id: int,
    session_id: str,
    request: OrderCreateRequest,
) -> Order:
    # 테이블 검증
    table = db.query(Table).filter(Table.id == table_id, Table.store_id == store.id).first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="테이블을 찾을 수 없습니다")

    # 메뉴 검증 및 OrderItem 구성
    order_items = []
    total_amount = 0
    for item in request.items:
        menu = db.query(Menu).filter(Menu.id == item.menu_id, Menu.store_id == store.id).first()
        if not menu:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"메뉴 {item.menu_id}를 찾을 수 없습니다")
        if not menu.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"'{menu.name}'은 현재 주문 불가 메뉴입니다")
        order_items.append(OrderItem(
            menu_id=menu.id,
            menu_name=menu.name,
            unit_price=menu.price,
            quantity=item.quantity,
        ))
        total_amount += menu.price * item.quantity

    order_number = generate_order_number(db, date.today())
    order = Order(
        order_number=order_number,
        table_id=table_id,
        session_id=session_id,
        total_amount=total_amount,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_orders_for_admin(db: Session, store: Store) -> List[Order]:
    """관리자: 매장 전체 활성 주문 조회"""
    table_ids = [t.id for t in db.query(Table).filter(Table.store_id == store.id).all()]
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.table_id.in_(table_ids))
        .order_by(Order.created_at.asc())
        .all()
    )


def get_orders_for_table(db: Session, table_id: int, session_id: str) -> List[Order]:
    """고객: 현재 세션 주문 조회"""
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.table_id == table_id, Order.session_id == session_id)
        .order_by(Order.created_at.asc())
        .all()
    )


def update_order_status(db: Session, store: Store, order_id: int, new_status: OrderStatus) -> Order:
    table_ids = [t.id for t in db.query(Table).filter(Table.store_id == store.id).all()]
    order = db.query(Order).filter(Order.id == order_id, Order.table_id.in_(table_ids)).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다")

    # 상태 전이 검증 (PENDING→PREPARING→COMPLETED만 허용)
    transitions = {
        OrderStatus.PENDING: OrderStatus.PREPARING,
        OrderStatus.PREPARING: OrderStatus.COMPLETED,
    }
    if transitions.get(order.status) != new_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="허용되지 않는 상태 전이입니다")

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order


def delete_order(db: Session, store: Store, order_id: int) -> Order:
    table_ids = [t.id for t in db.query(Table).filter(Table.store_id == store.id).all()]
    order = db.query(Order).filter(Order.id == order_id, Order.table_id.in_(table_ids)).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="주문을 찾을 수 없습니다")
    db.delete(order)
    db.commit()
    return order
