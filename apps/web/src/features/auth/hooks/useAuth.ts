/** Хук для работы с аутентификацией"""
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, LoginRequest, RegisterRequest } from '../api/authApi'
import { authStorage } from '@/shared/utils/storage'
import { TokenResponse } from '@/shared/types'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data: TokenResponse) => {
      authStorage.setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      navigate('/map')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      // После регистрации предлагаем войти
      navigate('/login')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authStorage.clear()
      queryClient.clear()
      navigate('/login')
    },
  })

  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!authStorage.getAccessToken(),
    retry: false,
  })

  return {
    user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: () => logoutMutation.mutate(),
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || registerMutation.error || logoutMutation.error,
  }
}

