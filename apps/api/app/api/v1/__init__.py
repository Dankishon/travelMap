"""API v1 роутеры"""
from fastapi import APIRouter
from app.api.v1.routers import auth, places, routes

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(places.router)
api_router.include_router(routes.router)
