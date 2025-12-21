# Docker инструкции для TravelMap Russia

## Быстрый старт

### Важно: Запустите Docker Desktop

Перед запуском убедитесь, что Docker Desktop запущен:
- **macOS/Windows**: Откройте приложение Docker Desktop и дождитесь его полной загрузки
- **Linux**: Убедитесь, что Docker daemon запущен: `sudo systemctl start docker`

```bash
# Запуск приложения
docker-compose up --build

# Откройте в браузере: http://localhost:5001

**Примечание:** Используется порт 5001, так как порт 5000 часто занят системным процессом macOS (AirPlay Receiver).
```

## Подробная инструкция

### Требования

- Docker (версия 20.10+)
- Docker Compose (версия 1.29+)

Проверка установки:
```bash
docker --version
docker-compose --version
```

### Первый запуск

1. **Сборка и запуск:**
   ```bash
   docker-compose up --build
   ```

2. **Откройте браузер:**
   ```
   http://localhost:5001
   ```

3. **Остановка:**
   Нажмите `Ctrl+C` или в другом терминале:
   ```bash
   docker-compose down
   ```

### Запуск в фоновом режиме

```bash
docker-compose up -d --build
```

Проверка статуса:
```bash
docker-compose ps
```

Просмотр логов:
```bash
docker-compose logs -f
```

Остановка:
```bash
docker-compose down
```

## Структура Docker конфигурации

### Dockerfile

- Базовый образ: `python:3.11-slim`
- Устанавливает зависимости из `requirements.txt`
- Копирует файлы приложения
- Инициализирует данные
- Открывает порт 5000

### docker-compose.yml

- Сервис `backend`: Flask приложение
- Порт: 5000:5000
- Volume: `./data:/app/data` (данные сохраняются на хосте)
- Healthcheck: проверка доступности API

## Работа с данными

Данные сохраняются в папке `data/` на вашем компьютере благодаря volume mount.

Это означает:
- ✅ Данные сохраняются между перезапусками контейнера
- ✅ Можно редактировать файлы напрямую
- ✅ При удалении контейнера данные не теряются

## Обновление приложения

После изменения кода:

```bash
# Пересборка и перезапуск
docker-compose up --build
```

Или если контейнер уже запущен:

```bash
docker-compose restart
```

## Отладка

### Вход в контейнер

```bash
docker-compose exec backend bash
```

### Просмотр логов

```bash
docker-compose logs -f backend
```

### Проверка здоровья

```bash
docker-compose ps
```

### Тестирование API

```bash
# Проверка доступности мест
curl http://localhost:5001/api/places

# Регистрация пользователя
curl -X POST http://localhost:5001/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

## Очистка

### Остановка и удаление контейнеров

```bash
docker-compose down
```

### Удаление образов

```bash
docker-compose down --rmi all
```

### Полная очистка (включая volumes)

```bash
docker-compose down -v
```

⚠️ **Внимание**: Это удалит все данные из папки `data/`!

## Проблемы и решения

### Docker daemon не запущен

**Ошибка:** `Cannot connect to the Docker daemon... Is the docker daemon running?`

**Решение:**
- **macOS/Windows**: Запустите Docker Desktop из Applications
- **Linux**: Выполните `sudo systemctl start docker`
- Проверьте статус: `docker ps`

### Порт 5001 уже занят

Если порт 5001 тоже занят, измените порт в `docker-compose.yml`:
```yaml
ports:
  - "5002:5000"  # Используйте другой порт (например, 5002)
```

**Примечание:** По умолчанию используется порт 5001, так как порт 5000 часто занят системным процессом macOS (AirPlay Receiver).

### Ошибка при сборке

```bash
# Очистите кэш Docker
docker system prune -a

# Пересоберите
docker-compose build --no-cache
```

### Данные не сохраняются

Проверьте права доступа к папке `data/`:
```bash
chmod -R 777 data/
```

### Контейнер не запускается

Проверьте логи:
```bash
docker-compose logs backend
```

## Production настройки

Для продакшена рекомендуется:

1. Использовать переменные окружения для секретов
2. Настроить HTTPS (через nginx reverse proxy)
3. Использовать базу данных вместо JSON файлов
4. Настроить логирование
5. Добавить мониторинг

Пример `.env` файла:
```env
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=your-secret-key-here
```

И обновите `docker-compose.yml`:
```yaml
environment:
  - FLASK_ENV=${FLASK_ENV}
  - FLASK_DEBUG=${FLASK_DEBUG}
```

