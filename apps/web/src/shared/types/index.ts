/** Типы для всего приложения */

export interface User {
  id: number
  username: string
  email?: string
}

export interface Place {
  id: number
  title: string
  description?: string
  lat: number
  lon: number
  category?: string
  region?: string
}

export interface RouteItem {
  id: number
  place_id: number
  position: number
  place: Place
}

export interface Route {
  id: number
  user_id: number
  name: string
  created_at: string
  items: RouteItem[]
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

