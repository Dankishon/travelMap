"""Модели маршрутов"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Route(Base):
    """Модель маршрута"""
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False, default="Мой маршрут")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    user = relationship("User", back_populates="routes")
    items = relationship("RouteItem", back_populates="route", cascade="all, delete-orphan", order_by="RouteItem.position")


class RouteItem(Base):
    """Элемент маршрута (связь маршрута с местом)"""
    __tablename__ = "route_items"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    
    # Связи
    route = relationship("Route", back_populates="items")
    place = relationship("Place")

