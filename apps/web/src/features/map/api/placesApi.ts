/** API для мест"""
import apiClient from '@/shared/api/client'
import { Place } from '@/shared/types'

export const placesApi = {
  getPlaces: async (): Promise<Place[]> => {
    const response = await apiClient.get('/places')
    return response.data
  },
}

