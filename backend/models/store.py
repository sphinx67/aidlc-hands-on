from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    admin_username = Column(String(50), nullable=False)
    admin_password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    tables = relationship("Table", back_populates="store")
    categories = relationship("Category", back_populates="store")
    menus = relationship("Menu", back_populates="store")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String(50), nullable=False)
    display_order = Column(Integer, default=0)

    store = relationship("Store", back_populates="categories")
    menus = relationship("Menu", back_populates="category")


class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)

    store = relationship("Store", back_populates="menus")
    category = relationship("Category", back_populates="menus")
