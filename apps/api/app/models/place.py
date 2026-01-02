"""Модель места"""
from sqlalchemy import Column, Integer, String, Float, Text
from app.db.base import Base


class Place(Base):
    """Модель места (достопримечательность)"""
    __tablename__ = "places"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    category = Column(String, nullable=True)
    region = Column(String, nullable=True, index=True)

