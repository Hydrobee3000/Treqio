import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import { AuthCallbackPage } from '@/pages/auth-callback'
import { LibraryPage } from '@/pages/library'
import { LoginPage } from '@/pages/login'
import { ProfilePage } from '@/pages/profile'
import { useAppSelector } from '@/shared/lib/store'
import { AppLayout } from '@/widgets/layout'

/**
 * Защита приватных роутов — редирект на /login если пользователь не авторизован.
 */
function RequireAuth() {
  const { accessToken, isInitialized } = useAppSelector((s) => s.auth)

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

  if (!accessToken) {
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
      { path: '/', element: <Navigate to="/library" replace /> },
      {
        element: <AppLayout />,
        children: [
          { path: '/library', element: <LibraryPage /> }, // Библиотека
          { path: '/profile', element: <ProfilePage /> }, // Профиль пользователя
        ],
      },
    ],
  },
])
