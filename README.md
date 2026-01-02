# TravelMap Russia

Production-ready веб-приложение для планирования туристических маршрутов по России.

## Архитектура

Проект организован как monorepo:

```
TravelAPP/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # React + TypeScript frontend
├── infra/            # Docker Compose конфигурация
├── docs/             # Документация
│   └── legacy/       # Старые файлы Flask версии
├── README.md
├── QUICKSTART.md
└── STRUCTURE.md
```

## Технологический стек

### Backend
- **FastAPI** - современный веб-фреймворк
- **PostgreSQL** - реляционная БД
- **SQLAlchemy 2.0** - ORM
- **Alembic** - миграции БД
- **JWT** - аутентификация
- **bcrypt** - хэширование паролей

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **TanStack Query** - управление состоянием сервера
- **MapLibre GL JS** - карты
- **Tailwind CSS** - стилизация

## Быстрый старт

### Требования
- Docker и Docker Compose
- Node.js 20+ (для локальной разработки фронтенда)

### Запуск через Docker Compose

1. Перейдите в корень проекта:
```bash
cd TravelAPP
```

2. Запустите все сервисы:
```bash
cd infra
docker-compose up -d
```

3. Подождите инициализации (около 30 секунд)

4. Откройте в браузере:
- Frontend: http://localhost
- API Docs: http://localhost:8000/docs
- API Health: http://localhost:8000/health

### Миграции БД

Миграции запускаются автоматически при старте API контейнера. Для ручного запуска:

```bash
docker-compose exec api alembic upgrade head
```

Создание новой миграции:
```bash
docker-compose exec api alembic revision --autogenerate -m "описание"
```

### Инициализация данных

Места (places) инициализируются автоматически при первом запуске через `init_places.py`.

Для ручного запуска:
```bash
docker-compose exec api python init_places.py
```

## Локальная разработка

### Backend

1. Установите зависимости:
```bash
cd apps/api
pip install -r requirements.txt
```

2. Создайте `.env` файл (см. `.env.example`)

3. Запустите PostgreSQL локально или через Docker:
```bash
docker run -d -p 5432:5432 -e POSTGRES_USER=travelmap -e POSTGRES_PASSWORD=travelmap123 -e POSTGRES_DB=travelmap postgres:15-alpine
```

4. Выполните миграции:
```bash
alembic upgrade head
python init_places.py
```

5. Запустите сервер:
```bash
uvicorn app.main:app --reload
```

### Frontend

1. Установите зависимости:
```bash
cd apps/web
npm install
```

2. Создайте `.env.local`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

3. Запустите dev сервер:
```bash
npm run dev
```

## API Эндпоинты

### Аутентификация
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `POST /api/v1/auth/refresh` - Обновление токена
- `POST /api/v1/auth/logout` - Выход
- `GET /api/v1/auth/me` - Текущий пользователь

### Места
- `GET /api/v1/places` - Список всех мест

### Маршруты (требуется авторизация)
- `GET /api/v1/routes` - Список маршрутов пользователя
- `POST /api/v1/routes` - Создать маршрут
- `PUT /api/v1/routes/{id}` - Обновить маршрут
- `DELETE /api/v1/routes/{id}` - Удалить маршрут

## Тестирование

### Backend
```bash
cd apps/api
pytest
```

### Frontend
```bash
cd apps/web
npm test
```

## Линтинг и форматирование

### Backend
```bash
cd apps/api
ruff check .
black .
mypy .
```

### Frontend
```bash
cd apps/web
npm run lint
npm run format
```

## Структура проекта

### Backend (apps/api)
```
app/
├── api/
│   └── v1/
│       ├── routers/    # API роутеры
│       └── schemas/    # Pydantic схемы
├── core/               # Конфигурация, security
├── db/                 # DB сессии
├── models/             # SQLAlchemy модели
├── repositories/       # Репозитории (доступ к БД)
└── services/           # Бизнес-логика
```

### Frontend (apps/web)
```
src/
├── app/
│   └── router/         # Роутинг
├── features/
│   ├── auth/           # Аутентификация
│   ├── map/            # Карта
│   └── routes/         # Маршруты
├── pages/              # Страницы
└── shared/             # Общие компоненты и утилиты
```

## Безопасность

- Пароли хэшируются с помощью bcrypt
- JWT токены для аутентификации
- Access токены короткоживущие (30 минут)
- Refresh токены долгоживущие (7 дней)
- CORS настроен для разрешённых доменов

## Production

Для production необходимо:

1. Изменить `SECRET_KEY` в `.env`
2. Настроить правильные `CORS_ORIGINS`
3. Использовать reverse proxy (nginx) для production
4. Настроить SSL/TLS сертификаты
5. Настроить логирование и мониторинг

## Лицензия

MIT

