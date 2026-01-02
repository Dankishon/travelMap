"""Сервис для работы с маршрутами"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from app.models.user import User
from app.repositories.route_repository import RouteRepository
from app.repositories.place_repository import PlaceRepository
from app.api.v1.schemas.route import RouteCreate, RouteUpdate


class RouteService:
    """Сервис для работы с маршрутами"""
    
    def __init__(self, db: Session):
        self.db = db
        self.route_repo = RouteRepository()
        self.place_repo = PlaceRepository()
    
    def get_user_routes(self, user: User) -> List:
        """Получает все маршруты пользователя"""
        return self.route_repo.get_by_user_id(self.db, user.id)
    
    def create_route(self, user: User, route_data: RouteCreate) -> Route:
        """Создаёт новый маршрут"""
        # Проверяем, что все места существуют
        if route_data.place_ids:
            places = self.place_repo.get_by_ids(self.db, route_data.place_ids)
            if len(places) != len(route_data.place_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Некоторые места не найдены"
                )
        
        return self.route_repo.create(self.db, user.id, route_data.name, route_data.place_ids)
    
    def update_route(self, user: User, route_id: int, route_data: RouteUpdate) -> Route:
        """Обновляет маршрут"""
        route = self.route_repo.get_by_id(self.db, route_id)
        if not route:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Маршрут не найден"
            )
        
        if route.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет доступа к этому маршруту"
            )
        
        # Проверяем места, если они указаны
        if route_data.place_ids is not None:
            places = self.place_repo.get_by_ids(self.db, route_data.place_ids)
            if len(places) != len(route_data.place_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Некоторые места не найдены"
                )
        
        return self.route_repo.update(
            self.db,
            route,
            name=route_data.name,
            place_ids=route_data.place_ids
        )
    
    def delete_route(self, user: User, route_id: int) -> None:
        """Удаляет маршрут"""
        route = self.route_repo.get_by_id(self.db, route_id)
        if not route:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Маршрут не найден"
            )
        
        if route.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет доступа к этому маршруту"
            )
        
        self.route_repo.delete(self.db, route)

