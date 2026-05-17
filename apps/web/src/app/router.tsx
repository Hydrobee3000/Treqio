import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { HomePage } from '@/pages/home'
import { LibraryPage } from '@/pages/library'
import { LoginPage } from '@/pages/login'
import { ProfilePage } from '@/pages/profile'
import { SettingsPage } from '@/pages/settings'
import { useAppSelector } from '@/shared/lib/store'
import { AppLayout } from '@/widgets/layout'

/**
 * Пропускает авторизованных пользователей и гостей, остальных редиректит на /login.
 */
function RequireAuth() {
  const { accessToken, isGuest, isInitialized } = useAppSelector((s) => s.auth)

  // Ждём завершения проверки сессии в AuthProvider перед редиректом
  if (!isInitialized) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!accessToken && !isGuest) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/**
 * Маршруты приложения.
 */
export const router = createBrowserRouter([
  // Публичные маршруты
  { path: '/login', element: <LoginPage /> }, // Страница входа
  { path: '/auth/callback', element: <AuthCallbackPage /> }, // Обработчик OAuth редиректа

  // Приватные маршруты
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HomePage /> }, // Домашняя страница
          { path: '/library', element: <LibraryPage /> }, // Библиотека
          { path: '/profile', element: <ProfilePage /> }, // Профиль пользователя
          { path: '/settings', element: <SettingsPage /> }, // Настройки
          { path: '/settings/:section', element: <SettingsPage /> }, // Раздел настроек
        ],
      },
    ],
  },
])
