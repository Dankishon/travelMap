/** API для маршрутов"""
import apiClient from '@/shared/api/client'
import { Route } from '@/shared/types'

export interface CreateRouteRequest {
  name: string
  place_ids: number[]
}

export interface UpdateRouteRequest {
  name?: string
  place_ids?: number[]
}

export const routesApi = {
  getRoutes: async (): Promise<Route[]> => {
    const response = await apiClient.get('/routes')
    return response.data
  },

  createRoute: async (data: CreateRouteRequest): Promise<Route> => {
    const response = await apiClient.post('/routes', data)
    return response.data
  },

  updateRoute: async (routeId: number, data: UpdateRouteRequest): Promise<Route> => {
    const response = await apiClient.put(`/routes/${routeId}`, data)
    return response.data
  },

  deleteRoute: async (routeId: number): Promise<void> => {
    await apiClient.delete(`/routes/${routeId}`)
  },
}

