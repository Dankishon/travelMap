"""Репозиторий для работы с местами"""
from sqlalchemy.orm import Session
from app.models.place import Place
from typing import List, Optional


class PlaceRepository:
    """Репозиторий мест"""
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Place]:
        """Получает все места"""
        return db.query(Place).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, place_id: int) -> Optional[Place]:
        """Находит место по ID"""
        return db.query(Place).filter(Place.id == place_id).first()
    
    @staticmethod
    def get_by_ids(db: Session, place_ids: List[int]) -> List[Place]:
        """Находит места по списку ID"""
        return db.query(Place).filter(Place.id.in_(place_ids)).all()

