# Как запустить Docker Desktop на macOS

## Проблема
Ошибка: `Cannot connect to the Docker daemon... Is the docker daemon running?`

## Решение

### Способ 1: Через приложение Docker Desktop

1. **Откройте Finder**
2. **Перейдите в Applications (Программы)**
3. **Найдите и запустите Docker Desktop**
   - Или используйте Spotlight: нажмите `Cmd + Space`, введите "Docker" и нажмите Enter

4. **Дождитесь запуска**
   - В строке меню (вверху экрана) появится иконка Docker (кит)
   - Иконка должна стать зелёной/стабильной (не мигать)
   - Это может занять 30-60 секунд

5. **Проверьте, что Docker работает:**
   ```bash
   docker ps
   ```
   Должна быть пустая таблица (без ошибок)

6. **Теперь запустите приложение:**
   ```bash
   docker-compose up --build
   ```

### Способ 2: Через командную строку

```bash
# Попробуйте открыть Docker Desktop через команду
open -a Docker
```

Затем подождите 30-60 секунд и проверьте:
```bash
docker ps
```

## Если Docker Desktop не установлен

1. **Скачайте Docker Desktop:**
   - Перейдите на https://www.docker.com/products/docker-desktop/
   - Скачайте версию для Mac (Apple Silicon или Intel)
   - Установите приложение

2. **После установки запустите Docker Desktop** и следуйте инструкциям выше

## Альтернатива: Запуск без Docker

Если не хотите использовать Docker, можно запустить приложение локально:

```bash
# 1. Установите зависимости
pip install -r requirements.txt

# 2. Инициализируйте данные
python init_data.py

# 3. Запустите сервер
python app.py
```

Затем откройте в браузере: `http://localhost:5000`

