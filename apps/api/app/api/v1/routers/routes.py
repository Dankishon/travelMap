"""Роутер для маршрутов"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.services.route_service import RouteService
from app.api.v1.schemas.route import (
    RouteCreate, RouteUpdate, RouteResponse
)
from app.models.user import User

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("", response_model=List[RouteResponse])
def get_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить все маршруты текущего пользователя"""
    route_service = RouteService(db)
    return route_service.get_user_routes(current_user)


@router.post("", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
def create_route(
    route_data: RouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создать новый маршрут"""
    route_service = RouteService(db)
    return route_service.create_route(current_user, route_data)


@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int,
    route_data: RouteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить маршрут"""
    route_service = RouteService(db)
    return route_service.update_route(current_user, route_id, route_data)


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить маршрут"""
    route_service = RouteService(db)
    route_service.delete_route(current_user, route_id)
    return None

