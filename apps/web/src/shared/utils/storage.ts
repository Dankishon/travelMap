/** Утилиты для работы с localStorage"""

export const storage = {
  get: (key: string): string | null => {
    return localStorage.getItem(key)
  },
  
  set: (key: string, value: string): void => {
    localStorage.setItem(key, value)
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key)
  },
  
  clear: (): void => {
    localStorage.clear()
  },
}

export const authStorage = {
  getAccessToken: (): string | null => storage.get('access_token'),
  getRefreshToken: (): string | null => storage.get('refresh_token'),
  setTokens: (accessToken: string, refreshToken: string): void => {
    storage.set('access_token', accessToken)
    storage.set('refresh_token', refreshToken)
  },
  clear: (): void => {
    storage.remove('access_token')
    storage.remove('refresh_token')
  },
}

