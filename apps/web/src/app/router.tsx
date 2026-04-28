// Конфигурация роутов всего приложения.
// createBrowserRouter использует History API браузера — URL выглядят как обычные (/library),
// а не с хэшем (/#/library как в старых SPA).
import { createBrowserRouter, Navigate } from 'react-router'
import { LibraryPage } from '@/pages/library'

export const router = createBrowserRouter([
  {
    // Редирект с корня на /library — главную страницу приложения.
    path: '/',
    element: <Navigate to="/library" replace />,
  },
  {
    path: '/library',
    element: <LibraryPage />,
  },
])
