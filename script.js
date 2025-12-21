// ============================================
// КОНФИГУРАЦИЯ API
// ============================================
// Автоматически определяем URL API (работает и локально, и в Docker)
const API_BASE_URL = window.location.origin + '/api';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let map = null;
let markers = [];
let places = [];  // Загружаются с сервера
let route = [];
let currentPlace = null;
let authToken = null;
let currentUsername = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли сохранённый токен
    const savedToken = localStorage.getItem('travelmap-token');
    const savedUsername = localStorage.getItem('travelmap-username');
    
    if (savedToken && savedUsername) {
        // Пользователь уже авторизован
        authToken = savedToken;
        currentUsername = savedUsername;
        showApp();
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
        document.getElementById('register-form').classList.add('active');
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').classList.remove('active');
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
        link.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Закрытие карточки места
    document.getElementById('close-card').addEventListener('click', function() {
        document.getElementById('place-card').classList.add('hidden');
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
async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        showError(errorDiv, 'Заполните все поля');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Успешный вход
            authToken = data.token;
            currentUsername = data.username;
            
            // Сохраняем в localStorage
            localStorage.setItem('travelmap-token', authToken);
            localStorage.setItem('travelmap-username', currentUsername);
            
            // Показываем приложение
            showApp();
        } else {
            showError(errorDiv, data.error || 'Ошибка входа');
        }
    } catch (error) {
        showError(errorDiv, 'Ошибка соединения с сервером');
        console.error('Login error:', error);
    }
}

async function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    if (!username || !password) {
        showError(errorDiv, 'Заполните все поля');
        return;
    }
    
    if (password.length < 4) {
        showError(errorDiv, 'Пароль должен быть не менее 4 символов');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Успешная регистрация, переключаемся на форму входа
            document.getElementById('register-form').classList.remove('active');
            document.getElementById('login-form').classList.add('active');
            document.getElementById('login-username').value = username;
            showError(document.getElementById('login-error'), 'Регистрация успешна! Войдите в систему.');
        } else {
            showError(errorDiv, data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        showError(errorDiv, 'Ошибка соединения с сервером');
        console.error('Register error:', error);
    }
}

function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        authToken = null;
        currentUsername = null;
        localStorage.removeItem('travelmap-token');
        localStorage.removeItem('travelmap-username');
        showAuthScreen();
    }
}

function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app').classList.remove('active');
    // Очищаем формы
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('register-error').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app').classList.add('active');
    document.getElementById('username-display').textContent = currentUsername;
    
    // Загружаем данные и инициализируем карту
    loadPlaces();
    loadRoute();
    initMap();
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

async function loadRoute() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/routes`, {
            headers: {
                'Authorization': authToken
            }
        });
        
        if (response.ok) {
            const routes = await response.json();
            if (routes.length > 0) {
                route = routes[0].places || [];
            } else {
                route = [];
            }
            
            // Обновляем отображение маршрута
            if (document.getElementById('page-route').classList.contains('active')) {
                renderRouteList();
            }
        } else {
            console.error('Ошибка загрузки маршрута');
            route = [];
        }
    } catch (error) {
        console.error('Ошибка загрузки маршрута:', error);
        route = [];
    }
}

async function saveRoute() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: JSON.stringify({ places: route })
        });
        
        if (!response.ok) {
            console.error('Ошибка сохранения маршрута');
        }
    } catch (error) {
        console.error('Ошибка сохранения маршрута:', error);
    }
}

async function clearRoute() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/routes`, {
            method: 'DELETE',
            headers: {
                'Authorization': authToken
            }
        });
        
        if (response.ok) {
            route = [];
            if (map) {
                map.eachLayer(function(layer) {
                    if (layer instanceof L.Polyline) {
                        map.removeLayer(layer);
                    }
                });
            }
            renderRouteList();
        }
    } catch (error) {
        console.error('Ошибка очистки маршрута:', error);
    }
}

// ============================================
// НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ
// ============================================
function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById('page-' + pageName).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    if (pageName === 'route') {
        renderRouteList();
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ============================================
function initMap() {
    if (map) {
        return;
    }
    
    map = L.map('map').setView([61.0, 99.0], 4);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Добавляем метки после загрузки мест
    if (places.length > 0) {
        updateMapMarkers();
    }
    
    if (route.length > 0) {
        showRouteOnMap();
    }
}

function updateMapMarkers() {
    // Удаляем старые метки
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Добавляем новые метки
    places.forEach(place => {
        addMarker(place);
    });
}

// ============================================
// ДОБАВЛЕНИЕ МЕТКИ НА КАРТУ
// ============================================
function addMarker(place) {
    const icon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    const marker = L.marker([place.lat, place.lng], { icon: icon })
        .addTo(map)
        .bindPopup(`<b>${place.name}</b><br>${place.city}`)
        .on('click', function() {
            showPlaceCard(place);
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
    
    const isInRoute = route.some(p => p.id === place.id);
    const addBtn = document.getElementById('add-to-route');
    
    if (isInRoute) {
        addBtn.textContent = 'Уже в маршруте';
        addBtn.disabled = true;
        addBtn.style.opacity = '0.6';
    } else {
        addBtn.textContent = 'Добавить в маршрут';
        addBtn.disabled = false;
        addBtn.style.opacity = '1';
    }
    
    document.getElementById('place-card').classList.remove('hidden');
}

// ============================================
// РАБОТА С МАРШРУТОМ
// ============================================
function addToRoute(place) {
    if (route.some(p => p.id === place.id)) {
        alert('Это место уже в маршруте!');
        return;
    }
    
    route.push(place);
    saveRoute();
    
    if (map) {
        showRouteOnMap();
    }
    
    if (document.getElementById('page-route').classList.contains('active')) {
        renderRouteList();
    }
    
    alert(`"${place.name}" добавлено в маршрут!`);
}

async function removeFromRoute(placeId) {
    route = route.filter(p => p.id !== placeId);
    await saveRoute();
    
    if (map) {
        showRouteOnMap();
    }
    
    renderRouteList();
}

// ============================================
// ОТОБРАЖЕНИЕ МАРШРУТА НА КАРТЕ
// ============================================
function showRouteOnMap() {
    if (!map || route.length === 0) {
        return;
    }
    
    map.eachLayer(function(layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
    
    if (route.length > 1) {
        const routePoints = route.map(place => [place.lat, place.lng]);
        
        const routeLine = L.polyline(routePoints, {
            color: '#667eea',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
        
        const group = new L.featureGroup([routeLine]);
        map.fitBounds(group.getBounds().pad(0.1));
    } else if (route.length === 1) {
        map.setView([route[0].lat, route[0].lng], 8);
    }
}

// ============================================
// ОТОБРАЖЕНИЕ СПИСКА МАРШРУТА
// ============================================
function renderRouteList() {
    const routeList = document.getElementById('route-list');
    
    if (route.length === 0) {
        routeList.innerHTML = '<p class="empty-message">Маршрут пуст. Добавьте места на карте!</p>';
        return;
    }
    
    routeList.innerHTML = route.map((place, index) => `
        <div class="route-item">
            <div class="route-item-info">
                <h4>${index + 1}. ${place.name}</h4>
                <p>${place.city}</p>
            </div>
            <button class="remove-btn" onclick="removeFromRoute(${place.id})">Удалить</button>
        </div>
    `).join('');
}
