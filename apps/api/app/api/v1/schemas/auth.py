"""Pydantic схемы для аутентификации"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    """Схема регистрации пользователя"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)
    email: Optional[EmailStr] = None


class UserLogin(BaseModel):
    """Схема входа"""
    username: str
    password: str


class Token(BaseModel):
    """Схема токена"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Схема refresh токена"""
    refresh_token: str


class UserResponse(BaseModel):
    """Схема ответа с данными пользователя"""
    id: int
    username: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

