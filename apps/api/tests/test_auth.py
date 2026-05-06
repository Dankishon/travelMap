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


def test_get_current_user_with_access_token(client, db):
    """Тест получения текущего пользователя по access token"""
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    access_token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_refresh_access_token(client, db):
    """Тест обновления access token"""
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "testpass123"}
    )
    refresh_token = login_response.json()["refresh_token"]

    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["refresh_token"] == refresh_token
