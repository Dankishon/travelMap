/** Layout с навигацией"""
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/map" className="text-xl font-bold">
              🗺️ TravelMap Russia
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/map"
                className={`px-3 py-2 rounded transition-colors ${
                  isActive('/map')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-700/50'
                }`}
              >
                Карта
              </Link>
              <Link
                to="/routes"
                className={`px-3 py-2 rounded transition-colors ${
                  isActive('/routes')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-700/50'
                }`}
              >
                Мои маршруты
              </Link>

              <div className="flex items-center gap-3 pl-6 border-l border-blue-500">
                <span className="text-sm">👤 {user?.username}</span>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors text-sm"
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

