import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/widgets/layout'
import { LibraryPage } from '@/pages/library'
import { ProfilePage } from '@/pages/profile'

/**
 * Маршруты приложения
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/library" replace />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/library', element: <LibraryPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
])
