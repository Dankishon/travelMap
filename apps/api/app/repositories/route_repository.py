"""Репозиторий для работы с маршрутами"""
from sqlalchemy.orm import Session
from app.models.route import Route, RouteItem
from typing import List, Optional


class RouteRepository:
    """Репозиторий маршрутов"""
    
    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> List[Route]:
        """Получает все маршруты пользователя"""
        return db.query(Route).filter(Route.user_id == user_id).order_by(Route.created_at.desc()).all()
    
    @staticmethod
    def get_by_id(db: Session, route_id: int) -> Optional[Route]:
        """Находит маршрут по ID"""
        return db.query(Route).filter(Route.id == route_id).first()
    
    @staticmethod
    def create(db: Session, user_id: int, name: str, place_ids: List[int]) -> Route:
        """Создаёт новый маршрут с местами"""
        route = Route(user_id=user_id, name=name)
        db.add(route)
        db.flush()
        
        # Добавляем места в маршрут
        for position, place_id in enumerate(place_ids):
            route_item = RouteItem(route_id=route.id, place_id=place_id, position=position)
            db.add(route_item)
        
        db.commit()
        db.refresh(route)
        return route
    
    @staticmethod
    def update(db: Session, route: Route, name: Optional[str] = None, place_ids: Optional[List[int]] = None) -> Route:
        """Обновляет маршрут"""
        if name is not None:
            route.name = name
        
        if place_ids is not None:
            # Удаляем старые элементы
            db.query(RouteItem).filter(RouteItem.route_id == route.id).delete()
            # Добавляем новые
            for position, place_id in enumerate(place_ids):
                route_item = RouteItem(route_id=route.id, place_id=place_id, position=position)
                db.add(route_item)
        
        db.commit()
        db.refresh(route)
        return route
    
    @staticmethod
    def delete(db: Session, route: Route) -> None:
        """Удаляет маршрут"""
        db.delete(route)
        db.commit()

