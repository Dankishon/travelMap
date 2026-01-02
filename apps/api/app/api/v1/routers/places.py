"""Роутер для мест"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.repositories.place_repository import PlaceRepository
from app.api.v1.schemas.place import PlaceResponse

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=List[PlaceResponse])
def get_places(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список всех мест (доступно без авторизации)"""
    place_repo = PlaceRepository()
    places = place_repo.get_all(db, skip=skip, limit=limit)
    return places

