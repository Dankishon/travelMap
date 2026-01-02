"""Pydantic схемы для маршрутов"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.api.v1.schemas.place import PlaceResponse


class RouteItemCreate(BaseModel):
    """Схема создания элемента маршрута"""
    place_id: int
    position: int = 0


class RouteCreate(BaseModel):
    """Схема создания маршрута"""
    name: str = "Мой маршрут"
    place_ids: List[int] = Field(default_factory=list)


class RouteItemResponse(BaseModel):
    """Схема ответа с элементом маршрута"""
    id: int
    place_id: int
    position: int
    place: PlaceResponse
    
    class Config:
        from_attributes = True


class RouteResponse(BaseModel):
    """Схема ответа с маршрутом"""
    id: int
    user_id: int
    name: str
    created_at: datetime
    items: List[RouteItemResponse] = []
    
    class Config:
        from_attributes = True


class RouteUpdate(BaseModel):
    """Схема обновления маршрута"""
    name: Optional[str] = None
    place_ids: Optional[List[int]] = None

