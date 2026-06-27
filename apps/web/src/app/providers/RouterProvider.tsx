import { RouterProvider as ReactRouterProvider } from 'react-router'
import { router } from '../router'

/**
 * Подключает роутер к приложению
 */
export const RouterProvider = () => <ReactRouterProvider router={router} />
