"""Тесты для аутентификации"""


def test_register_user(client, db):
    """Тест регистрации пользователя"""
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"


def test_register_user_with_email(client, db):
    """Тест регистрации пользователя с email"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "password": "testpass123",
            "email": "test@example.com"
        }
    )
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"
    assert response.json()["email"] == "test@example.com"


def test_register_duplicate_username(client, db):
    """Тест повторной регистрации с тем же username"""
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "testpass123"}
    )

    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "password": "anotherpass"}
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Пользователь с таким именем уже существует"


def test_register_validation_error(client, db):
    """Тест ошибки валидации при коротком username/password"""
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "ab", "password": "123"}
    )

    assert response.status_code == 422


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
