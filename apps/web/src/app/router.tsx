import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation, useParams } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import { useGetMeQuery } from '@/features/user'
import { saveRedirectPath } from '@/shared/lib/redirectPath'
import { useAppSelector } from '@/shared/lib/store'
import { PageFallback } from '@/shared/ui'
import { AppLayout } from '@/widgets/layout'
import { ErrorFallback } from './ErrorFallback/ErrorFallback'

// Каждая страница — отдельный чанк, подгружается только при переходе на неё
const HomePage = lazy(() => import('@/pages/home').then((module) => ({ default: module.HomePage })))
const LibraryPage = lazy(() =>
  import('@/pages/library').then((module) => ({ default: module.LibraryPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/profile').then((module) => ({ default: module.ProfilePage })),
)
const UserProfilePage = lazy(() =>
  import('@/pages/user-profile').then((module) => ({ default: module.UserProfilePage })),
)
const SearchPage = lazy(() =>
  import('@/pages/search').then((module) => ({ default: module.SearchPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((module) => ({ default: module.SettingsPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/login').then((module) => ({ default: module.LoginPage })),
)
const AuthCallbackPage = lazy(() =>
  import('@/pages/auth-callback').then((module) => ({ default: module.AuthCallbackPage })),
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
 * Свой профиль по адресу /profile — перенаправляет на адрес с никнеймом.
 * Гость остаётся на /profile: никнейма у него нет.
 */
function OwnProfileRedirect() {
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const { data: me, isLoading } = useGetMeQuery(undefined, { skip: isGuest })

  if (isGuest) return <ProfilePage />
  if (isLoading) return <PageFallback />
  if (me?.username) return <Navigate to={`/${me.username}`} replace />
  return <ProfilePage />
}

/**
 * Профиль по никнейму — свой открывается той же страницей, что и раньше.
 */
function ProfileByUsername() {
  const { username } = useParams()
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const { data: me, isLoading } = useGetMeQuery(undefined, { skip: isGuest })

  if (!username) return <Navigate to="/" replace />
  if (!isGuest && isLoading) return <PageFallback />
  if (me?.username === username) return <ProfilePage />
  return <UserProfilePage username={username} />
}

/**
 * Маршруты приложения.
 */
export const router = createBrowserRouter([
  {
    // errorElement, общий для всех маршрутов
    id: 'root',
    element: <Outlet />,
    errorElement: <ErrorFallback />,
    children: [
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
              { path: '/search', element: <SearchPage /> }, // Поиск людей
              { path: '/profile', element: <OwnProfileRedirect /> }, // Свой профиль
              { path: '/settings', element: <SettingsPage /> }, // Настройки
              { path: '/settings/:section', element: <SettingsPage /> }, // Раздел настроек
              // Ловит адреса, не совпавшие с маршрутами выше: несуществующий
              // никнейм показывает состояние «пользователь не найден».
              { path: '/:username', element: <ProfileByUsername /> }, // Профиль по никнейму
            ],
          },
        ],
      },
    ],
  },
])
