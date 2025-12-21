// ============================================
// ДАННЫЕ О МЕСТАХ (захардкоженные)
// ============================================
const places = [
    {
        id: 1,
        name: "Красная площадь",
        description: "Главная площадь Москвы, символ России. Здесь находятся Кремль, Собор Василия Блаженного и Мавзолей Ленина.",
        lat: 55.7539,
        lng: 37.6208,
        city: "Москва"
    },
    {
        id: 2,
        name: "Эрмитаж",
        description: "Один из крупнейших художественных музеев мира, расположенный в Санкт-Петербурге. Более 3 миллионов экспонатов.",
        lat: 59.9398,
        lng: 30.3146,
        city: "Санкт-Петербург"
    },
    {
        id: 3,
        name: "Озеро Байкал",
        description: "Самое глубокое озеро в мире, объект Всемирного наследия ЮНЕСКО. Уникальная природа и чистейшая вода.",
        lat: 53.4125,
        lng: 108.1681,
        city: "Иркутская область"
    },
    {
        id: 4,
        name: "Кижи",
        description: "Музей-заповедник деревянного зодчества на острове в Онежском озере. Знаменит Преображенской церковью.",
        lat: 62.0667,
        lng: 35.2167,
        city: "Карелия"
    },
    {
        id: 5,
        name: "Долина гейзеров",
        description: "Единственное гейзерное поле в Евразии, расположенное на Камчатке. Уникальная природная достопримечательность.",
        lat: 54.4306,
        lng: 160.1394,
        city: "Камчатка"
    },
    {
        id: 6,
        name: "Мамаев курган",
        description: "Мемориальный комплекс в Волгограде, посвящённый Сталинградской битве. Главный монумент — «Родина-мать зовёт!»",
        lat: 48.7425,
        lng: 44.5370,
        city: "Волгоград"
    },
    {
        id: 7,
        name: "Собор Василия Блаженного",
        description: "Православный храм на Красной площади в Москве, один из самых узнаваемых символов России.",
        lat: 55.7525,
        lng: 37.6231,
        city: "Москва"
    },
    {
        id: 8,
        name: "Петергоф",
        description: "Дворцово-парковый ансамбль под Санкт-Петербургом, знаменитый своими фонтанами и парками.",
        lat: 59.8833,
        lng: 29.9000,
        city: "Санкт-Петербург"
    },
    {
        id: 9,
        name: "Кунгурская пещера",
        description: "Одна из самых известных пещер Урала. Подземные озёра, сталактиты и сталагмиты создают фантастический пейзаж.",
        lat: 57.4333,
        lng: 57.0000,
        city: "Пермский край"
    },
    {
        id: 10,
        name: "Алтайские горы",
        description: "Горная система на юге Сибири с уникальной природой, чистыми озёрами и богатой флорой и фауной.",
        lat: 50.0000,
        lng: 86.0000,
        city: "Алтай"
    },
    {
        id: 11,
        name: "Сочи",
        description: "Курортный город на Чёрном море, столица зимних Олимпийских игр 2014 года. Пляжи, горы и парки.",
        lat: 43.6028,
        lng: 39.7342,
        city: "Краснодарский край"
    },
    {
        id: 12,
        name: "Калининград",
        description: "Западный форпост России, бывший Кёнигсберг. Уникальная архитектура и история, связанная с Пруссией.",
        lat: 54.7104,
        lng: 20.4522,
        city: "Калининград"
    },
    {
        id: 13,
        name: "Казанский Кремль",
        description: "Историческая крепость в Казани, объект Всемирного наследия ЮНЕСКО. Симбиоз русской и татарской культур.",
        lat: 55.7989,
        lng: 49.1053,
        city: "Казань"
    },
    {
        id: 14,
        name: "Золотое кольцо России",
        description: "Туристический маршрут по древним городам: Сергиев Посад, Переславль-Залесский, Ростов, Ярославль и другие.",
        lat: 57.6299,
        lng: 39.8737,
        city: "Ярославль"
    },
    {
        id: 15,
        name: "Эльбрус",
        description: "Высочайшая вершина России и Европы (5642 м). Популярное место для альпинизма и горнолыжного спорта.",
        lat: 43.3550,
        lng: 42.4392,
        city: "Кабардино-Балкария"
    }
];

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let map = null;
let markers = [];
let route = [];
let currentPlace = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка маршрута из localStorage
    loadRoute();
    
    // Обработчики событий
    setupEventListeners();
    
    // Инициализация карты (будет вызвана при открытии)
    // Карта инициализируется при нажатии на кнопку "Открыть карту"
});

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================
function setupEventListeners() {
    // Кнопка "Открыть карту" на главном экране
    document.getElementById('open-map-btn').addEventListener('click', function() {
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('app').classList.add('active');
        initMap();
    });
    
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
        // Небольшая задержка, чтобы карта успела отобразиться
        setTimeout(function() {
            if (map) {
                showRouteOnMap();
            }
        }, 100);
    });
}

// ============================================
// НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ
// ============================================
function switchPage(pageName) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Показываем выбранную страницу
    document.getElementById('page-' + pageName).classList.add('active');
    
    // Обновляем активную ссылку в навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // Если открываем страницу маршрута, обновляем список
    if (pageName === 'route') {
        renderRouteList();
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ============================================
function initMap() {
    // Проверяем, не инициализирована ли карта уже
    if (map) {
        return;
    }
    
    // Создаём карту, центрированную на России
    map = L.map('map').setView([61.0, 99.0], 4);
    
    // Добавляем слой карты OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Добавляем метки всех мест
    places.forEach(place => {
        addMarker(place);
    });
    
    // Если есть сохранённый маршрут, показываем его
    if (route.length > 0) {
        showRouteOnMap();
    }
}

// ============================================
// ДОБАВЛЕНИЕ МЕТКИ НА КАРТУ
// ============================================
function addMarker(place) {
    // Создаём иконку для метки
    const icon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    // Создаём метку
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
    
    // Проверяем, есть ли уже это место в маршруте
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
    // Проверяем, нет ли уже этого места в маршруте
    if (route.some(p => p.id === place.id)) {
        alert('Это место уже в маршруте!');
        return;
    }
    
    // Добавляем место в маршрут
    route.push(place);
    
    // Сохраняем в localStorage
    saveRoute();
    
    // Обновляем отображение маршрута на карте
    if (map) {
        showRouteOnMap();
    }
    
    // Обновляем список маршрута, если открыта страница маршрута
    if (document.getElementById('page-route').classList.contains('active')) {
        renderRouteList();
    }
    
    // Показываем сообщение
    alert(`"${place.name}" добавлено в маршрут!`);
}

function removeFromRoute(placeId) {
    route = route.filter(p => p.id !== placeId);
    saveRoute();
    
    if (map) {
        showRouteOnMap();
    }
    
    renderRouteList();
}

function clearRoute() {
    route = [];
    saveRoute();
    
    if (map) {
        // Удаляем линию маршрута с карты
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });
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
    
    // Удаляем старую линию маршрута
    map.eachLayer(function(layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
    
    // Если в маршруте больше одного места, рисуем линию
    if (route.length > 1) {
        const routePoints = route.map(place => [place.lat, place.lng]);
        
        const routeLine = L.polyline(routePoints, {
            color: '#667eea',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
        
        // Подгоняем карту, чтобы показать весь маршрут
        const group = new L.featureGroup([routeLine]);
        map.fitBounds(group.getBounds().pad(0.1));
    } else if (route.length === 1) {
        // Если только одно место, центрируем карту на нём
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

// ============================================
// СОХРАНЕНИЕ И ЗАГРУЗКА МАРШРУТА
// ============================================
function saveRoute() {
    localStorage.setItem('travelmap-route', JSON.stringify(route));
}

function loadRoute() {
    const saved = localStorage.getItem('travelmap-route');
    if (saved) {
        try {
            route = JSON.parse(saved);
        } catch (e) {
            console.error('Ошибка загрузки маршрута:', e);
            route = [];
        }
    }
}

