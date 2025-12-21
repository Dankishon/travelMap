# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем все файлы приложения
COPY . .

# Создаём папку для данных (если её нет)
RUN mkdir -p data

# Инициализируем данные (если файл places.json не существует)
RUN python init_data.py || true

# Открываем порт 5000
EXPOSE 5000

# Переменные окружения
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Запускаем приложение
CMD ["python", "app.py"]

