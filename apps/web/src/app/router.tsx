import { createBrowserRouter, Navigate } from 'react-router'
import { LibraryPage } from '@/pages/library'

/**
 * Маршруты приложения
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/library" replace />,
  },
  {
    path: '/library',
    element: <LibraryPage />,
  },
])
