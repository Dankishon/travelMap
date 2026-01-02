"""
TravelMap Russia - Backend API
Простой Flask сервер для учебного проекта
Версия 2.0 (с авторизацией и серверным хранением)
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Разрешаем запросы с фронтенда

# Путь к папке с данными
DATA_DIR = 'data'

# ============================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ============================================

def ensure_data_dir():
    """Создаёт папку data, если её нет"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def read_json(filename):
    """Читает JSON файл"""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_json(filename, data):
    """Записывает данные в JSON файл"""
    ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def hash_password(password):
    """Хэширует пароль (простой способ для учебного проекта)"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """Генерирует случайный токен"""
    return secrets.token_urlsafe(32)

def get_user_by_token(token):
    """Находит пользователя по токену"""
    tokens = read_json('tokens.json')
    for token_data in tokens:
        if token_data['token'] == token:
            # Проверяем, не истёк ли токен (24 часа)
            expires = datetime.fromisoformat(token_data['expires'])
            if datetime.now() < expires:
                return token_data['username']
    return None

def require_auth(f):
    """Декоратор для проверки авторизации"""
    from functools import wraps
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Требуется авторизация'}), 401
        
        # Убираем "Bearer " если есть
        if token.startswith('Bearer '):
            token = token[7:]
        
        username = get_user_by_token(token)
        if not username:
            return jsonify({'error': 'Недействительный токен'}), 401
        
        # Добавляем username в kwargs для использования в функции
        return f(*args, current_user=username, **kwargs)
    return wrapper

# ============================================
# API ЭНДПОИНТЫ
# ============================================

@app.route('/api/register', methods=['POST'])
def register():
    """Регистрация нового пользователя"""
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Требуется username и password'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    # Проверка на пустые поля
    if not username or not password:
        return jsonify({'error': 'Username и password не могут быть пустыми'}), 400
    
    # Проверка минимальной длины пароля
    if len(password) < 4:
        return jsonify({'error': 'Пароль должен быть не менее 4 символов'}), 400
    
    # Проверяем, существует ли пользователь
    users = read_json('users.json')
    for user in users:
        if user['username'] == username:
            return jsonify({'error': 'Пользователь с таким именем уже существует'}), 400
    
    # Создаём нового пользователя
    new_user = {
        'username': username,
        'password_hash': hash_password(password),
        'created_at': datetime.now().isoformat()
    }
    
    users.append(new_user)
    write_json('users.json', users)
    
    return jsonify({'message': 'Пользователь успешно зарегистрирован'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Вход пользователя"""
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Требуется username и password'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    # Ищем пользователя
    users = read_json('users.json')
    user = None
    for u in users:
        if u['username'] == username:
            user = u
            break
    
    if not user:
        return jsonify({'error': 'Неверный логин или пароль'}), 401
    
    # Проверяем пароль
    if user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Неверный логин или пароль'}), 401
    
    # Генерируем токен
    token = generate_token()
    expires = datetime.now() + timedelta(hours=24)
    
    # Сохраняем токен
    tokens = read_json('tokens.json')
    tokens.append({
        'token': token,
        'username': username,
        'created_at': datetime.now().isoformat(),
        'expires': expires.isoformat()
    })
    write_json('tokens.json', tokens)
    
    return jsonify({
        'token': token,
        'username': username,
        'message': 'Успешный вход'
    }), 200

@app.route('/api/places', methods=['GET'])
def get_places():
    """Получить список интересных мест (доступно без авторизации)"""
    places = read_json('places.json')
    return jsonify(places), 200

@app.route('/api/routes', methods=['GET'])
@require_auth
def get_routes(current_user):
    """Получить маршруты текущего пользователя"""
    username = current_user
    routes = read_json('routes.json')
    
    # Фильтруем маршруты по пользователю
    user_routes = [r for r in routes if r['username'] == username]
    
    return jsonify(user_routes), 200

@app.route('/api/routes', methods=['POST'])
@require_auth
def save_route(current_user):
    """Сохранить маршрут пользователя"""
    username = current_user
    data = request.get_json()
    
    if not data or 'places' not in data:
        return jsonify({'error': 'Требуется массив places'}), 400
    
    # Читаем существующие маршруты
    routes = read_json('routes.json')
    
    # Ищем маршрут пользователя или создаём новый
    user_route = None
    for r in routes:
        if r['username'] == username:
            user_route = r
            break
    
    if user_route:
        # Обновляем существующий маршрут
        user_route['places'] = data['places']
        user_route['updated_at'] = datetime.now().isoformat()
    else:
        # Создаём новый маршрут
        new_route = {
            'username': username,
            'places': data['places'],
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        routes.append(new_route)
    
    write_json('routes.json', routes)
    
    return jsonify({'message': 'Маршрут сохранён'}), 200

@app.route('/api/routes', methods=['DELETE'])
@require_auth
def clear_route(current_user):
    """Очистить маршрут пользователя"""
    username = current_user
    routes = read_json('routes.json')
    
    # Удаляем маршрут пользователя
    routes = [r for r in routes if r['username'] != username]
    
    write_json('routes.json', routes)
    
    return jsonify({'message': 'Маршрут очищен'}), 200

# ============================================
# СТАТИЧЕСКИЕ ФАЙЛЫ (для Docker)
# ============================================

@app.route('/')
def index():
    """Главная страница"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Раздача статических файлов (CSS, JS)"""
    # Разрешаем только определённые файлы
    allowed_extensions = ['.css', '.js', '.html', '.png', '.jpg', '.jpeg', '.gif', '.ico']
    if any(path.endswith(ext) for ext in allowed_extensions):
        return send_from_directory('.', path)
    return jsonify({'error': 'Not found'}), 404

# ============================================
# ЗАПУСК СЕРВЕРА
# ============================================

if __name__ == '__main__':
    # Инициализируем данные при первом запуске
    ensure_data_dir()
    
    # Если файлы не существуют, создаём пустые
    if not os.path.exists(os.path.join(DATA_DIR, 'users.json')):
        write_json('users.json', [])
    if not os.path.exists(os.path.join(DATA_DIR, 'tokens.json')):
        write_json('tokens.json', [])
    if not os.path.exists(os.path.join(DATA_DIR, 'routes.json')):
        write_json('routes.json', [])
    
    # Запускаем сервер
    # В Docker используем host='0.0.0.0' для доступности извне
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)

