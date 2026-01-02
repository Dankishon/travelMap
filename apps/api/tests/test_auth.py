"""Тесты для аутентификации"""
import pytest
from app.services.auth_service import AuthService
from app.api.v1.schemas.auth import UserRegister, UserLogin


def test_register_user(client, db):
    """Тест регистрации пользователя"""
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"


def test_login_user(client, db):
    """Тест входа пользователя"""
    # Сначала регистрируем
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    
    # Затем логинимся
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()


def test_login_wrong_password(client, db):
    """Тест входа с неверным паролем"""
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "wrongpass"}
    )
    assert response.status_code == 401

