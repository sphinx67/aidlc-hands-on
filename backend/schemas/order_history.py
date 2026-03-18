from pydantic import BaseModel
from typing import List
from datetime import datetime
from models.order import OrderStatus


class OrderHistoryItemResponse(BaseModel):
    id: int
    menu_name: str
    unit_price: int
    quantity: int

    class Config:
        from_attributes = True


class OrderHistoryResponse(BaseModel):
    id: int
    order_number: str
    table_id: int
    session_id: str
    status: OrderStatus
    total_amount: int
    items: List[OrderHistoryItemResponse]
    ordered_at: datetime
    completed_at: datetime

    class Config:
        from_attributes = True
