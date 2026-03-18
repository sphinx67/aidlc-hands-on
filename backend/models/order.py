import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PREPARING = "PREPARING"
    COMPLETED = "COMPLETED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_number = Column(String(20), unique=True, nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    session_id = Column(String(36), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    total_amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    table = relationship("Table", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    menu_name = Column(String(100), nullable=False)   # 주문 시점 스냅샷
    unit_price = Column(Integer, nullable=False)       # 주문 시점 스냅샷
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
