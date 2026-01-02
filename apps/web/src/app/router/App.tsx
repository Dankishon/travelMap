/** Главный компонент приложения с роутингом"""
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import LoginPage from '@/pages/LoginPage'
import MapPage from '@/pages/MapPage'
import RoutesPage from '@/pages/RoutesPage'
import Layout from './Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const token = localStorage.getItem('access_token')

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapPage />} />
        <Route path="routes" element={<RoutesPage />} />
      </Route>
    </Routes>
  )
}

