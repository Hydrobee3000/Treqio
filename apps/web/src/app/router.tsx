import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import { saveRedirectPath } from '@/shared/lib/redirectPath'
import { useAppSelector } from '@/shared/lib/store'
import { PageFallback } from '@/shared/ui'
import { AppLayout } from '@/widgets/layout'

// Каждая страница — отдельный чанк, подгружается только при переходе на неё,
// а не единым бандлом со всеми страницами сразу (см. issue про code splitting).
const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const LibraryPage = lazy(() => import('@/pages/library').then((m) => ({ default: m.LibraryPage })))
const ProfilePage = lazy(() => import('@/pages/profile').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
)
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })))
const AuthCallbackPage = lazy(() =>
  import('@/pages/auth-callback').then((m) => ({ default: m.AuthCallbackPage })),
)

/**
 * Пропускает авторизованных пользователей и гостей, остальных редиректит на /login.
 */
function RequireAuth() {
  const { accessToken, isGuest, isInitialized } = useAppSelector((s) => s.auth)
  const location = useLocation()

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
    saveRedirectPath(location.pathname)
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/**
 * Маршруты приложения.
 */
export const router = createBrowserRouter([
  // Публичные маршруты — своего общего каркаса нет, поэтому у каждого свой fallback
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <Suspense fallback={<PageFallback />}>
        <AuthCallbackPage />
      </Suspense>
    ),
  },

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
