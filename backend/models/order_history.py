from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from models.order import OrderStatus


class OrderHistory(Base):
    __tablename__ = "order_histories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_number = Column(String(20), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    session_id = Column(String(36), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False)
    total_amount = Column(Integer, nullable=False)
    ordered_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=False)

    table = relationship("Table", back_populates="order_histories")
    items = relationship("OrderHistoryItem", back_populates="order_history", cascade="all, delete-orphan")


class OrderHistoryItem(Base):
    __tablename__ = "order_history_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_history_id = Column(Integer, ForeignKey("order_histories.id"), nullable=False)
    menu_name = Column(String(100), nullable=False)
    unit_price = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)

    order_history = relationship("OrderHistory", back_populates="items")
