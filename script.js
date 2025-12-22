// ============================================
// КОНФИГУРАЦИЯ API
// ============================================
// Автоматически определяем URL API (работает и локально, и в Docker)
const API_BASE_URL = window.location.origin + '/api';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let map = null;  // MapLibre GL карта
let markers = [];  // Массив маркеров (MapLibre markers)
let places = [];  // Загружаются с сервера
let route = [];
let currentPlace = null;
let authToken = null;
let currentUsername = null;
let routeLineId = 'route-line';  // ID для линии маршрута

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    // Проверяем, есть ли сохранённый токен
    const savedToken = localStorage.getItem('travelmap-token');
    const savedUsername = localStorage.getItem('travelmap-username');
    
    if (savedToken && savedUsername) {
        // Проверяем валидность токена перед показом приложения
        const isValid = await validateToken(savedToken);
        
        if (isValid) {
            // Токен валиден, показываем приложение
            authToken = savedToken;
            currentUsername = savedUsername;
            showApp();
        } else {
            // Токен невалиден или истёк, очищаем и показываем экран входа
            localStorage.removeItem('travelmap-token');
            localStorage.removeItem('travelmap-username');
            showAuthScreen();
            showToast('Сессия истекла. Войдите снова.', 'warning');
        }
    } else {
        // Показываем экран авторизации
        showAuthScreen();
    }
    
    // Обработчики событий
    setupEventListeners();
});

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================
function setupEventListeners() {
    // Переключение между формой входа и регистрации
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('login-form').classList.add('d-none');
        document.getElementById('register-form').classList.remove('d-none');
        document.getElementById('register-form').classList.add('active');
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('register-form').classList.add('d-none');
        document.getElementById('login-form').classList.remove('d-none');
        document.getElementById('login-form').classList.add('active');
    });
    
    // Кнопка входа
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    
    // Кнопка регистрации
    document.getElementById('register-btn').addEventListener('click', handleRegister);
    
    // Вход по Enter
    document.getElementById('login-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('register-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleRegister();
    });
    
    // Кнопка выхода
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Навигация между страницами
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Закрытие карточки места
    document.getElementById('close-card').addEventListener('click', function() {
        document.getElementById('place-card').classList.add('d-none');
        currentPlace = null;
    });
    
    // Добавление места в маршрут
    document.getElementById('add-to-route').addEventListener('click', function() {
        if (currentPlace) {
            addToRoute(currentPlace);
        }
    });
    
    // Очистка маршрута
    document.getElementById('clear-route').addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите очистить маршрут?')) {
            clearRoute();
        }
    });
    
    // Просмотр маршрута на карте
    document.getElementById('view-route-on-map').addEventListener('click', function() {
        switchPage('map');
        setTimeout(function() {
            if (map) {
                showRouteOnMap();
            }
        }, 100);
    });
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================
/**
 * Обрабатывает вход пользователя
 */
async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    
    // Валидация полей
    if (!username || !password) {
        showError(errorDiv, 'Заполните все поля');
        return;
    }
    
    // Показываем индикатор загрузки
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Вход...';
    
    try {
        const { response, data } = await apiRequest(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            // Успешный вход
            authToken = data.token;
            currentUsername = data.username;
            
            // Сохраняем в localStorage
            localStorage.setItem('travelmap-token', authToken);
            localStorage.setItem('travelmap-username', currentUsername);
            
            // Показываем уведомление об успешном входе
            showToast(`Добро пожаловать, ${currentUsername}!`, 'success');
            
            // Показываем приложение
            showApp();
        } else {
            // Ошибка входа (неверный логин/пароль)
            showError(errorDiv, data.error || 'Неверный логин или пароль');
        }
    } catch (error) {
        if (error.message === 'Network error') {
            showError(errorDiv, 'Ошибка соединения с сервером. Проверьте подключение к интернету.');
        } else {
            showError(errorDiv, 'Ошибка входа. Попробуйте снова.');
            console.error('Login error:', error);
        }
    } finally {
        // Восстанавливаем кнопку
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
    }
}

/**
 * Обрабатывает регистрацию нового пользователя
 */
async function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const registerBtn = document.getElementById('register-btn');
    
    // Валидация полей
    if (!username || !password) {
        showError(errorDiv, 'Заполните все поля');
        return;
    }
    
    if (username.length < 3) {
        showError(errorDiv, 'Имя пользователя должно быть не менее 3 символов');
        return;
    }
    
    if (password.length < 4) {
        showError(errorDiv, 'Пароль должен быть не менее 4 символов');
        return;
    }
    
    // Показываем индикатор загрузки
    const originalText = registerBtn.innerHTML;
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Регистрация...';
    
    try {
        const { response, data } = await apiRequest(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            // Успешная регистрация
            showToast('Регистрация успешна! Войдите в систему.', 'success');
            
            // Переключаемся на форму входа
            document.getElementById('register-form').classList.remove('active');
            document.getElementById('register-form').classList.add('d-none');
            document.getElementById('login-form').classList.remove('d-none');
            document.getElementById('login-form').classList.add('active');
            document.getElementById('login-username').value = username;
            
            // Очищаем ошибки
            errorDiv.classList.add('d-none');
        } else {
            // Ошибка регистрации (пользователь уже существует и т.д.)
            showError(errorDiv, data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        if (error.message === 'Network error') {
            showError(errorDiv, 'Ошибка соединения с сервером. Проверьте подключение к интернету.');
        } else {
            showError(errorDiv, 'Ошибка регистрации. Попробуйте снова.');
            console.error('Register error:', error);
        }
    } finally {
        // Восстанавливаем кнопку
        registerBtn.disabled = false;
        registerBtn.innerHTML = originalText;
    }
}

/**
 * Обрабатывает выход пользователя из системы
 */
function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        authToken = null;
        currentUsername = null;
        localStorage.removeItem('travelmap-token');
        localStorage.removeItem('travelmap-username');
        
        // Очищаем маршрут
        route = [];
        
        // Очищаем карту от линии маршрута
        if (map) {
            if (map.getLayer(routeLineId)) {
                map.removeLayer(routeLineId);
            }
            if (map.getSource(routeLineId)) {
                map.removeSource(routeLineId);
            }
        }
        
        showAuthScreen();
        showToast('Вы вышли из системы', 'info');
    }
}

// ============================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С API
// ============================================

/**
 * Проверяет валидность токена на сервере
 * @param {string} token - Токен для проверки
 * @returns {Promise<boolean>} - true если токен валиден
 */
async function validateToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/routes`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });
        
        // Если получили ответ (даже пустой массив), токен валиден
        return response.status !== 401;
    } catch (error) {
        console.error('Ошибка проверки токена:', error);
        return false;
    }
}

/**
 * Универсальная функция для выполнения API запросов с обработкой ошибок
 * @param {string} url - URL запроса
 * @param {object} options - Опции fetch запроса
 * @returns {Promise<object>} - Результат запроса {response, data}
 */
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Обработка ошибок авторизации (только для защищённых эндпоинтов)
        // Для /login и /register не обрабатываем 401 как критическую ошибку
        if (response.status === 401 && !url.includes('/login') && !url.includes('/register')) {
            // Токен истёк или невалиден
            localStorage.removeItem('travelmap-token');
            localStorage.removeItem('travelmap-username');
            showAuthScreen();
            showToast('Сессия истекла. Войдите снова.', 'warning');
            throw new Error('Unauthorized');
        }
        
        return { response, data };
    } catch (error) {
        // Обработка сетевых ошибок
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showToast('Ошибка соединения с сервером. Проверьте подключение к интернету.', 'danger');
            throw new Error('Network error');
        }
        throw error;
    }
}

// ============================================
// УВЕДОМЛЕНИЯ И СООБЩЕНИЯ
// ============================================

/**
 * Показывает сообщение об ошибке в форме
 * @param {HTMLElement} errorDiv - Элемент для отображения ошибки
 * @param {string} message - Текст сообщения
 */
function showError(errorDiv, message) {
    errorDiv.textContent = message;
    // Убеждаемся, что это alert-danger (для ошибок)
    errorDiv.classList.remove('alert-success', 'd-none');
    errorDiv.classList.add('alert-danger');
    errorDiv.classList.remove('d-none');
    // Автоматически скрыть через 5 секунд
    setTimeout(() => {
        errorDiv.classList.add('d-none');
    }, 5000);
}

/**
 * Показывает toast уведомление пользователю
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип уведомления: 'success', 'danger', 'warning', 'info'
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toastId = 'toast-' + Date.now();
    
    // Иконки для разных типов уведомлений
    const icons = {
        success: 'bi-check-circle-fill',
        danger: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };
    
    // Цвета для разных типов
    const colors = {
        success: 'text-success',
        danger: 'text-danger',
        warning: 'text-warning',
        info: 'text-info'
    };
    
    // Создаём элемент toast
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi ${icons[type]} ${colors[type]} me-2"></i>
                <strong class="me-auto">TravelMap</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Инициализируем и показываем toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: type === 'success' ? 3000 : 5000
    });
    
    toast.show();
    
    // Удаляем элемент после скрытия
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app').classList.add('d-none');
    document.getElementById('app').classList.remove('active');
    // Очищаем формы
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('login-error').classList.add('d-none');
    document.getElementById('register-error').classList.add('d-none');
}

function showApp() {
    // Плавный переход: скрываем экран авторизации
    document.getElementById('auth-screen').classList.remove('active');
    
    // Показываем приложение
    document.getElementById('app').classList.remove('d-none');
    document.getElementById('app').classList.add('active');
    
    // Обновляем имя пользователя
    document.getElementById('username-display').textContent = currentUsername;
    
    // Загружаем данные и инициализируем карту
    loadPlaces();
    loadRoute();
    
    // Небольшая задержка для плавного перехода перед инициализацией карты
    setTimeout(() => {
        initMap();
    }, 100);
}

// ============================================
// РАБОТА С API
// ============================================
async function loadPlaces() {
    try {
        const response = await fetch(`${API_BASE_URL}/places`);
        if (response.ok) {
            places = await response.json();
            // Обновляем карту, если она уже инициализирована
            if (map) {
                updateMapMarkers();
            }
        } else {
            console.error('Ошибка загрузки мест');
        }
    } catch (error) {
        console.error('Ошибка загрузки мест:', error);
    }
}

/**
 * Загружает маршрут пользователя с сервера
 */
async function loadRoute() {
    if (!authToken) return;
    
    try {
        const { response, data } = await apiRequest(`${API_BASE_URL}/routes`, {
            headers: {
                'Authorization': authToken
            }
        });
        
        if (response.ok) {
            // data - это массив маршрутов пользователя
            if (data.length > 0) {
                route = data[0].places || [];
            } else {
                route = [];
            }
            
            // Обновляем отображение маршрута, если открыта страница маршрута
            if (document.getElementById('page-route').classList.contains('active')) {
                renderRouteList();
            }
            
            // Если есть маршрут и открыта карта, показываем его
            if (route.length > 0 && map && document.getElementById('page-map').classList.contains('active')) {
                showRouteOnMap();
            }
        } else {
            route = [];
            console.error('Ошибка загрузки маршрута:', data.error);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            route = [];
            console.error('Ошибка загрузки маршрута:', error);
        }
    }
}

/**
 * Сохраняет маршрут пользователя на сервере
 */
async function saveRoute() {
    if (!authToken) {
        showToast('Ошибка: требуется авторизация', 'danger');
        return;
    }
    
    try {
        const { response, data } = await apiRequest(`${API_BASE_URL}/routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: JSON.stringify({ places: route })
        });
        
        if (response.ok) {
            // Маршрут успешно сохранён (тихо, без уведомления при каждом сохранении)
            console.log('Маршрут сохранён');
        } else {
            showToast('Не удалось сохранить маршрут', 'danger');
            console.error('Ошибка сохранения маршрута:', data.error);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            showToast('Ошибка сохранения маршрута', 'danger');
            console.error('Ошибка сохранения маршрута:', error);
        }
    }
}

/**
 * Очищает маршрут пользователя на сервере
 */
async function clearRoute() {
    if (!authToken) {
        showToast('Ошибка: требуется авторизация', 'danger');
        return;
    }
    
    try {
        const { response, data } = await apiRequest(`${API_BASE_URL}/routes`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });
        
        if (response.ok) {
            route = [];
            
            // Удаляем линию маршрута с карты
            if (map) {
                if (map.getLayer(routeLineId)) {
                    map.removeLayer(routeLineId);
                }
                if (map.getSource(routeLineId)) {
                    map.removeSource(routeLineId);
                }
            }
            
            renderRouteList();
            showToast('Маршрут очищен', 'success');
        } else {
            showToast('Не удалось очистить маршрут', 'danger');
            console.error('Ошибка очистки маршрута:', data.error);
        }
    } catch (error) {
        if (error.message !== 'Unauthorized') {
            showToast('Ошибка очистки маршрута', 'danger');
            console.error('Ошибка очистки маршрута:', error);
        }
    }
}

// ============================================
// НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ
// ============================================
function switchPage(pageName) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('d-none');
    });
    
    // Показываем выбранную страницу
    const targetPage = document.getElementById('page-' + pageName);
    targetPage.classList.remove('d-none');
    targetPage.classList.add('active');
    
    // Обновляем активную ссылку в навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // Специальная логика для разных страниц
    if (pageName === 'route') {
        renderRouteList();
    } else if (pageName === 'map') {
        // При возврате на карту обновляем отображение маршрута
        if (map && route.length > 0) {
            setTimeout(() => {
                showRouteOnMap();
            }, 100);
        }
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ (MapLibre GL JS)
// ============================================
function initMap() {
    if (map) {
        return;
    }
    
    // Инициализируем MapLibre GL карту
    map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                'osm': {
                    type: 'raster',
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors'
                }
            },
            layers: [{
                id: 'osm-layer',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 19
            }]
        },
        center: [99.0, 61.0],  // Центр России [долгота, широта]
        zoom: 4
    });
    
    // Добавляем навигационные элементы управления
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Ждём загрузки карты перед добавлением маркеров
    map.on('load', function() {
        // Добавляем метки после загрузки мест
        if (places.length > 0) {
            updateMapMarkers();
        }
        
        // Показываем маршрут, если он есть
        if (route.length > 0) {
            showRouteOnMap();
        }
    });
}

/**
 * Обновляет маркеры на карте
 */
function updateMapMarkers() {
    // Удаляем старые маркеры
    markers.forEach(marker => marker.remove());
    markers = [];
    
    // Добавляем новые маркеры
    places.forEach(place => {
        addMarker(place);
    });
}

// ============================================
// ДОБАВЛЕНИЕ МЕТКИ НА КАРТУ (MapLibre GL JS)
// ============================================
function addMarker(place) {
    // Создаём HTML элемент для маркера
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '30px';
    el.style.height = '40px';
    el.style.backgroundImage = 'url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png)';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';
    
    // Создаём маркер
    const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom'
    })
        .setLngLat([place.lng, place.lat])
        .setPopup(
            new maplibregl.Popup({ offset: 25 })
                .setHTML(`<b>${place.name}</b><br>${place.city}`)
        )
        .addTo(map);
    
    // Обработчик клика на маркер
    el.addEventListener('click', function() {
        showPlaceCard(place);
        marker.togglePopup();
    });
    
    markers.push(marker);
}

// ============================================
// ПОКАЗ КАРТОЧКИ МЕСТА
// ============================================
function showPlaceCard(place) {
    currentPlace = place;
    document.getElementById('place-name').textContent = place.name;
    document.getElementById('place-description').textContent = place.description;
    document.getElementById('place-city').textContent = place.city;
    
    const isInRoute = route.some(p => p.id === place.id);
    const addBtn = document.getElementById('add-to-route');
    
    if (isInRoute) {
        addBtn.innerHTML = '<i class="bi bi-check-circle"></i> Уже в маршруте';
        addBtn.disabled = true;
        addBtn.classList.remove('btn-primary');
        addBtn.classList.add('btn-success');
    } else {
        addBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Добавить в маршрут';
        addBtn.disabled = false;
        addBtn.classList.remove('btn-success');
        addBtn.classList.add('btn-primary');
    }
    
    document.getElementById('place-card').classList.remove('d-none');
}

// ============================================
// РАБОТА С МАРШРУТОМ
// ============================================
/**
 * Добавляет место в маршрут пользователя
 * @param {object} place - Объект места для добавления
 */
async function addToRoute(place) {
    // Проверка на дубликаты
    if (route.some(p => p.id === place.id)) {
        showToast('Это место уже в маршруте!', 'info');
        return;
    }
    
    // Добавляем место в маршрут
    route.push(place);
    
    // Сохраняем на сервере
    await saveRoute();
    
    // Обновляем отображение на карте
    if (map) {
        showRouteOnMap();
    }
    
    // Обновляем список маршрута, если открыта страница маршрута
    if (document.getElementById('page-route').classList.contains('active')) {
        renderRouteList();
    }
    
    // Показываем уведомление об успешном добавлении
    showToast(`"${place.name}" добавлено в маршрут!`, 'success');
    
    // Обновляем карточку места (кнопка должна стать "Уже в маршруте")
    showPlaceCard(place);
}

/**
 * Удаляет место из маршрута пользователя
 * @param {number} placeId - ID места для удаления
 */
async function removeFromRoute(placeId) {
    const place = route.find(p => p.id === placeId);
    route = route.filter(p => p.id !== placeId);
    
    // Сохраняем изменения на сервере
    await saveRoute();
    
    // Обновляем отображение на карте
    if (map) {
        showRouteOnMap();
    }
    
    // Обновляем список маршрута
    renderRouteList();
    
    // Показываем уведомление
    if (place) {
        showToast(`"${place.name}" удалено из маршрута`, 'info');
    }
}

// ============================================
// ОТОБРАЖЕНИЕ МАРШРУТА НА КАРТЕ (MapLibre GL JS)
// ============================================
function showRouteOnMap() {
    if (!map || route.length === 0) {
        return;
    }
    
    // Удаляем старую линию маршрута, если она есть
    if (map.getLayer(routeLineId)) {
        map.removeLayer(routeLineId);
    }
    if (map.getSource(routeLineId)) {
        map.removeSource(routeLineId);
    }
    
    if (route.length > 1) {
        // Создаём массив координат для линии маршрута
        // MapLibre использует формат [долгота, широта]
        const coordinates = route.map(place => [place.lng, place.lat]);
        
        // Добавляем источник данных для линии
        map.addSource(routeLineId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            }
        });
        
        // Добавляем слой линии маршрута
        map.addLayer({
            id: routeLineId,
            type: 'line',
            source: routeLineId,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#667eea',
                'line-width': 4,
                'line-opacity': 0.7
            }
        });
        
        // Подгоняем карту под маршрут
        const bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
        
        map.fitBounds(bounds, {
            padding: 50,
            duration: 1000
        });
    } else if (route.length === 1) {
        // Если только одно место, центрируем карту на нём
        map.flyTo({
            center: [route[0].lng, route[0].lat],
            zoom: 8,
            duration: 1000
        });
    }
}

// ============================================
// ОТОБРАЖЕНИЕ СПИСКА МАРШРУТА
// ============================================
/**
 * Отображает список мест в маршруте пользователя
 */
function renderRouteList() {
    const routeList = document.getElementById('route-list');
    
    if (route.length === 0) {
        routeList.innerHTML = `
            <div class="alert alert-info" role="alert">
                <i class="bi bi-info-circle"></i> Маршрут пуст. Добавьте места на карте!
            </div>
        `;
        return;
    }
    
    // Показываем информацию о количестве мест
    routeList.innerHTML = `
        <div class="alert alert-success mb-3" role="alert">
            <i class="bi bi-check-circle"></i> В маршруте: <strong>${route.length}</strong> ${route.length === 1 ? 'место' : route.length < 5 ? 'места' : 'мест'}
        </div>
        ${route.map((place, index) => `
            <div class="route-item">
                <div class="route-item-info">
                    <h4>${index + 1}. ${place.name}</h4>
                    <p><i class="bi bi-geo-alt"></i> ${place.city}</p>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="removeFromRoute(${place.id})">
                    <i class="bi bi-trash"></i> Удалить
                </button>
            </div>
        `).join('')}
    `;
}
