# Структура проекта TravelMap Russia

## Общая структура (Monorepo)

```
TravelAPP/
├── apps/
│   ├── api/              # FastAPI Backend
│   └── web/              # React + TypeScript Frontend
├── infra/                # Docker Compose конфигурация
├── docs/                 # Документация
│   └── legacy/           # Старые файлы Flask версии
├── README.md             # Основная документация
├── QUICKSTART.md         # Быстрый старт
└── STRUCTURE.md          # Этот файл
```

## Backend (apps/api)

### Структура слоёв

```
apps/api/
├── app/
│   ├── main.py                    # Точка входа FastAPI
│   ├── core/
│   │   ├── config.py              # Pydantic Settings
│   │   └── security.py            # JWT, password hashing
│   ├── db/
│   │   └── base.py                # SQLAlchemy engine, session
│   ├── models/                    # SQLAlchemy модели
│   │   ├── user.py
│   │   ├── place.py
│   │   └── route.py
│   ├── repositories/              # Слой доступа к данным
│   │   ├── user_repository.py
│   │   ├── place_repository.py
│   │   └── route_repository.py
│   ├── services/                  # Бизнес-логика
│   │   ├── auth_service.py
│   │   └── route_service.py
│   └── api/
│       └── v1/
│           ├── routers/           # API эндпоинты
│           │   ├── auth.py
│           │   ├── places.py
│           │   └── routes.py
│           └── schemas/           # Pydantic схемы
│               ├── auth.py
│               ├── place.py
│               └── route.py
├── alembic/                       # Миграции БД
│   ├── versions/
│   └── env.py
├── tests/                         # Тесты
├── requirements.txt
├── Dockerfile
└── init_places.py                 # Инициализация данных
```

### Архитектурные слои

1. **Routers** (`api/v1/routers/`) - HTTP эндпоинты
2. **Schemas** (`api/v1/schemas/`) - Валидация входных/выходных данных
3. **Services** (`services/`) - Бизнес-логика
4. **Repositories** (`repositories/`) - Доступ к БД
5. **Models** (`models/`) - SQLAlchemy ORM модели

## Frontend (apps/web)

### Структура

```
apps/web/
├── src/
│   ├── app/
│   │   └── router/
│   │       ├── App.tsx            # Главный роутер
│   │       └── Layout.tsx         # Layout с навигацией
│   ├── pages/                     # Страницы
│   │   ├── LoginPage.tsx
│   │   ├── MapPage.tsx
│   │   └── RoutesPage.tsx
│   ├── features/                  # Фичи по доменам
│   │   ├── auth/
│   │   │   ├── api/               # API вызовы
│   │   │   └── hooks/             # React hooks
│   │   ├── map/
│   │   │   ├── api/
│   │   │   └── components/
│   │   └── routes/
│   │       └── api/
│   └── shared/                    # Общие утилиты
│       ├── api/
│       │   └── client.ts          # Axios клиент
│       ├── types/                 # TypeScript типы
│       └── utils/                 # Утилиты
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── Dockerfile
```

### Архитектура фронтенда

- **Feature-based** структура
- **React Query** для управления серверным состоянием
- **React Router** для роутинга
- **TypeScript** для типизации
- **Tailwind CSS** для стилей

## Команды запуска

### Docker Compose (рекомендуется)

```bash
cd infra
docker-compose up -d
```

Сервисы:
- PostgreSQL: `localhost:5432`
- API: `http://localhost:8000`
- Frontend: `http://localhost`

### Локальная разработка

#### Backend

```bash
cd apps/api
pip install -r requirements.txt
# Настроить .env (см. .env.example)
alembic upgrade head
python init_places.py
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd apps/web
npm install
npm run dev
```

## Ключевые файлы

### Backend

- `app/main.py` - FastAPI приложение
- `app/core/config.py` - Конфигурация через Pydantic
- `app/core/security.py` - JWT и password hashing
- `alembic/versions/001_initial.py` - Начальная миграция

### Frontend

- `src/main.tsx` - Точка входа React
- `src/app/router/App.tsx` - Роутинг
- `src/shared/api/client.ts` - API клиент с interceptors
- `src/features/map/components/MapView.tsx` - Компонент карты

## База данных

### Модели

1. **User** - пользователи
   - id, username, email, password_hash, created_at

2. **Place** - достопримечательности
   - id, title, description, lat, lon, category, region

3. **Route** - маршруты пользователей
   - id, user_id, name, created_at

4. **RouteItem** - элементы маршрута
   - id, route_id, place_id, position

## API эндпоинты

### `/api/v1/auth/`
- `POST /register` - Регистрация
- `POST /login` - Вход
- `POST /refresh` - Обновление токена
- `POST /logout` - Выход
- `GET /me` - Текущий пользователь

### `/api/v1/places/`
- `GET /` - Список мест

### `/api/v1/routes/` (требуется auth)
- `GET /` - Список маршрутов
- `POST /` - Создать маршрут
- `PUT /{id}` - Обновить маршрут
- `DELETE /{id}` - Удалить маршрут

## Безопасность

- Пароли: bcrypt
- JWT: access (30 мин) + refresh (7 дней)
- CORS настроен
- Валидация через Pydantic

