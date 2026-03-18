from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    table_number = Column(Integer, nullable=False)
    password_hash = Column(String(255), nullable=True)
    current_session_id = Column(String(36), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("store_id", "table_number", name="uq_store_table"),)

    store = relationship("Store", back_populates="tables")
    orders = relationship("Order", back_populates="table")
    order_histories = relationship("OrderHistory", back_populates="table")
