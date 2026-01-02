"""Роутер аутентификации"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.services.auth_service import AuthService
from app.api.v1.schemas.auth import (
    UserRegister, UserLogin, Token, TokenRefresh, UserResponse
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    auth_service = AuthService(db)
    user = auth_service.register(user_data)
    return user


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Вход в систему"""
    auth_service = AuthService(db)
    return auth_service.login(login_data)


@router.post("/refresh", response_model=Token)
def refresh(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """Обновление access token"""
    auth_service = AuthService(db)
    return auth_service.refresh_access_token(token_data.refresh_token)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Выход из системы (пока просто подтверждение, можно расширить инвалидацией токенов)"""
    return {"message": "Успешный выход"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user

