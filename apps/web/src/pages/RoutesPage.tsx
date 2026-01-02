/** Страница с маршрутами"""
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routesApi } from '@/features/routes/api/routesApi'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function RoutesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: routesApi.getRoutes,
    enabled: !!user,
  })

  const deleteRouteMutation = useMutation({
    mutationFn: routesApi.deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
    },
  })

  const handleDelete = (routeId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      deleteRouteMutation.mutate(routeId)
    }
  }

  if (isLoading) {
    return <div className="p-8">Загрузка маршрутов...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Мои маршруты</h1>

      {routes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">У вас пока нет сохранённых маршрутов</p>
          <p className="text-sm text-gray-500">
            Создайте маршрут на странице с картой
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{route.name}</h2>
                  <p className="text-sm text-gray-500">
                    Создан: {new Date(route.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(route.id)}
                  disabled={deleteRouteMutation.isPending}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  {deleteRouteMutation.isPending ? 'Удаление...' : 'Удалить'}
                </button>
              </div>

              {route.items.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Места в маршруте ({route.items.length}):
                  </p>
                  <ul className="space-y-1">
                    {route.items.map((item, index) => (
                      <li key={item.id} className="text-sm text-gray-600">
                        {index + 1}. {item.place.title} ({item.place.region})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Маршрут пуст</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

