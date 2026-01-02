# ✅ Репозиторий очищен

## Что было сделано

### 1. Удалена обёртка `travelmap-russia/`
- Содержимое `travelmap-russia/` перемещено в корень проекта
- Корень проекта теперь = основной корень приложения

### 2. Legacy файлы перемещены в `docs/legacy/`
Все старые файлы Flask версии сохранены для истории:
- `app.py` (старый Flask backend)
- `index.html`, `script.js`, `style.css` (старый vanilla JS frontend)
- `requirements.txt` (старые зависимости Flask)
- `docker-compose.yml`, `Dockerfile` (старая Docker конфигурация)
- `init_data.py` (старый скрипт инициализации)
- `data/` (старые JSON файлы)
- `README.md`, `QUICKSTART.md` (старая документация)
- `CHANGELOG.md`, `DOCKER.md`, `START_DOCKER.md` (исторические документы)

### 3. Актуальная структура

```
TravelAPP/                    # Корень проекта
├── apps/
│   ├── api/                 # FastAPI backend
│   │   ├── app/
│   │   ├── alembic/
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── init_places.py
│   └── web/                 # React frontend
│       ├── src/
│       ├── package.json
│       └── Dockerfile
├── infra/
│   └── docker-compose.yml   # ЕДИНСТВЕННЫЙ docker-compose
├── docs/
│   └── legacy/              # Старые файлы
├── README.md                # Актуальная документация
├── QUICKSTART.md            # Быстрый старт
└── STRUCTURE.md             # Описание структуры
```

## Entrypoints

### Backend
- **Локально**: `apps/api/app/main.py` → `uvicorn app.main:app --reload`
- **Docker**: через `infra/docker-compose.yml` → сервис `api`

### Frontend
- **Локально**: `apps/web/` → `npm run dev` (Vite dev server)
- **Docker**: через `infra/docker-compose.yml` → сервис `web`

### Docker Compose
- **Единственный файл**: `infra/docker-compose.yml`
- Запуск: `cd infra && docker-compose up -d`

## Проверка работы

### 1. Docker Compose
```bash
cd infra
docker-compose up -d
# Проверить: http://localhost (frontend), http://localhost:8000 (API)
```

### 2. Локальная разработка Backend
```bash
cd apps/api
pip install -r requirements.txt
# Настроить .env
alembic upgrade head
python init_places.py
uvicorn app.main:app --reload
```

### 3. Локальная разработка Frontend
```bash
cd apps/web
npm install
# Настроить .env.local с VITE_API_URL
npm run dev
```

## Результат

✅ Нет дублей файлов
✅ Единственный entrypoint для каждого компонента
✅ Чёткая структура monorepo
✅ Legacy файлы сохранены, но изолированы
✅ Документация актуальна и указывает на правильные пути

