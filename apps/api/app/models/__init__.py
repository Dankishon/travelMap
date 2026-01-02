"""Импорт всех моделей для Alembic"""
from app.models.user import User
from app.models.place import Place
from app.models.route import Route, RouteItem
from app.db.base import Base

__all__ = ["User", "Place", "Route", "RouteItem", "Base"]

