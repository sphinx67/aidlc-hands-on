from pydantic import BaseModel, field_validator
from typing import List
from datetime import datetime
from models.order import OrderStatus


class OrderItemCreate(BaseModel):
    menu_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("수량은 1 이상이어야 합니다")
        return v


class OrderCreateRequest(BaseModel):
    items: List[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def items_must_not_be_empty(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        if not v:
            raise ValueError("주문 항목은 최소 1개 이상이어야 합니다")
        return v


class OrderItemResponse(BaseModel):
    id: int
    menu_id: int
    menu_name: str
    unit_price: int
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_number: str
    table_id: int
    session_id: str
    status: OrderStatus
    total_amount: int
    items: List[OrderItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
