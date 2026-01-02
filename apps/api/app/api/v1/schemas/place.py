"""Pydantic схемы для мест"""
from pydantic import BaseModel
from typing import Optional


class PlaceBase(BaseModel):
    """Базовая схема места"""
    title: str
    description: Optional[str] = None
    lat: float
    lon: float
    category: Optional[str] = None
    region: Optional[str] = None


class PlaceCreate(PlaceBase):
    """Схема создания места"""
    pass


class PlaceResponse(PlaceBase):
    """Схема ответа с местом"""
    id: int
    
    class Config:
        from_attributes = True

