/** Компонент карты с функционалом маршрутов */
import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { placesApi } from '../api/placesApi'
import { routesApi } from '@/features/routes/api/routesApi'
import { Place } from '@/shared/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [currentRoutePlaces, setCurrentRoutePlaces] = useState<Place[]>([])
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: places = [] } = useQuery({
    queryKey: ['places'],
    queryFn: placesApi.getPlaces,
  })

  const { data: routes = [] } = useQuery({
    queryKey: ['routes'],
    queryFn: routesApi.getRoutes,
    enabled: !!user,
  })

  // Создание/обновление маршрута
  const saveRouteMutation = useMutation({
    mutationFn: (placeIds: number[]) => {
      if (routes.length > 0 && routes[0]) {
        return routesApi.updateRoute(routes[0].id, { place_ids: placeIds })
      }
      return routesApi.createRoute({
        name: 'Мой маршрут',
        place_ids: placeIds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    },
  })

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [99.0, 61.0],
      zoom: 4,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [])

  // Загружаем текущий маршрут
  useEffect(() => {
    if (routes.length > 0 && routes[0]) {
      const routePlaces = routes[0].items.map((item) => item.place)
      setCurrentRoutePlaces(routePlaces)
      drawRouteLine(routePlaces)
    } else {
      setCurrentRoutePlaces([])
      removeRouteLine()
    }
  }, [routes])

  // Добавление маркеров мест
  useEffect(() => {
    if (!map.current || places.length === 0) return

    // Удаляем старые маркеры
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    places.forEach((place) => {
      const el = document.createElement('div')
      el.className = 'w-6 h-8 cursor-pointer'
      const isInRoute = currentRoutePlaces.some((p) => p.id === place.id)
      el.style.backgroundImage = isInRoute
        ? 'url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png)'
        : 'url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png)'
      el.style.backgroundSize = 'cover'

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lon, place.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<b>${place.title}</b><br>${place.region || ''}`
          )
        )
        .addTo(map.current!)

      el.addEventListener('click', () => {
        setSelectedPlace(place)
      })

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
    }
  }, [places, currentRoutePlaces])

  // Рисуем линию маршрута
  const drawRouteLine = (routePlaces: Place[]) => {
    if (!map.current || routePlaces.length < 2) return

    const coordinates = routePlaces.map((p) => [p.lon, p.lat] as [number, number])

    // Удаляем старую линию, если есть
    if (map.current.getLayer('route-line')) {
      map.current.removeLayer('route-line')
    }
    if (map.current.getSource('route-line')) {
      map.current.removeSource('route-line')
    }

    // Добавляем новую линию
    map.current.addSource('route-line', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    })

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route-line',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#667eea',
        'line-width': 4,
        'line-opacity': 0.7,
      },
    })

    // Подгоняем карту под маршрут
    if (coordinates.length > 1) {
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      )
      map.current.fitBounds(bounds, { padding: 50, duration: 1000 })
    }
  }

  const removeRouteLine = () => {
    if (!map.current) return
    if (map.current.getLayer('route-line')) {
      map.current.removeLayer('route-line')
    }
    if (map.current.getSource('route-line')) {
      map.current.removeSource('route-line')
    }
  }

  const handleAddToRoute = () => {
    if (!selectedPlace) return

    const isInRoute = currentRoutePlaces.some((p) => p.id === selectedPlace.id)
    if (isInRoute) {
      // Удаляем из маршрута
      const newPlaces = currentRoutePlaces.filter((p) => p.id !== selectedPlace.id)
      setCurrentRoutePlaces(newPlaces)
      saveRouteMutation.mutate(newPlaces.map((p) => p.id))
    } else {
      // Добавляем в маршрут
      const newPlaces = [...currentRoutePlaces, selectedPlace]
      setCurrentRoutePlaces(newPlaces)
      saveRouteMutation.mutate(newPlaces.map((p) => p.id))
    }
  }

  if (!user) {
    return <div>Загрузка...</div>
  }

  const isPlaceInRoute = selectedPlace
    ? currentRoutePlaces.some((p) => p.id === selectedPlace.id)
    : false

  return (
    <div className="h-full relative">
      <div ref={mapContainer} className="w-full h-full" />

      {selectedPlace && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{selectedPlace.title}</h3>
            <button
              onClick={() => setSelectedPlace(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {selectedPlace.description && (
            <p className="text-sm text-gray-600 mb-2">{selectedPlace.description}</p>
          )}
          {selectedPlace.region && (
            <p className="text-xs text-gray-500 mb-3">📍 {selectedPlace.region}</p>
          )}
          <button
            onClick={handleAddToRoute}
            disabled={saveRouteMutation.isPending}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isPlaceInRoute
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {saveRouteMutation.isPending
              ? 'Сохранение...'
              : isPlaceInRoute
              ? '✓ В маршруте'
              : 'Добавить в маршрут'}
          </button>
        </div>
      )}

      {currentRoutePlaces.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10">
          <p className="text-sm font-medium text-gray-700 mb-2">
            В маршруте: {currentRoutePlaces.length} {currentRoutePlaces.length === 1 ? 'место' : 'мест'}
          </p>
          <button
            onClick={() => {
              setCurrentRoutePlaces([])
              saveRouteMutation.mutate([])
            }}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Очистить маршрут
          </button>
        </div>
      )}
    </div>
  )
}
