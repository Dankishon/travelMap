"""Сервис аутентификации"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.security import (
    verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
)
from app.core.config import settings
from app.api.v1.schemas.auth import UserRegister, UserLogin, Token


class AuthService:
    """Сервис для работы с аутентификацией"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository()
    
    def register(self, user_data: UserRegister) -> User:
        """Регистрирует нового пользователя"""
        # Проверяем, существует ли пользователь
        existing_user = self.user_repo.get_by_username(self.db, user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует"
            )
        
        # Хэшируем пароль и создаём пользователя
        password_hash = get_password_hash(user_data.password)
        user = self.user_repo.create(
            self.db,
            username=user_data.username,
            password_hash=password_hash,
            email=user_data.email
        )
        return user
    
    def login(self, login_data: UserLogin) -> Token:
        """Выполняет вход и возвращает токены"""
        user = self.user_repo.get_by_username(self.db, login_data.username)
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный логин или пароль"
            )
        
        # Создаём токены
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    
    def refresh_access_token(self, refresh_token: str) -> Token:
        """Обновляет access token используя refresh token"""
        payload = decode_token(refresh_token)
        if payload is None or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Недействительный refresh token"
            )
        
        user_id = payload.get("sub")
        user = self.user_repo.get_by_id(self.db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден"
            )
        
        # Создаём новый access token
        access_token = create_access_token(data={"sub": user.id})
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,  # Refresh token остаётся тем же
            token_type="bearer"
        )

