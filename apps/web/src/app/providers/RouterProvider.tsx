// Провайдер роутера — подключает React Router к приложению.
// RouterProvider из react-router рендерит нужный компонент в зависимости от текущего URL.
import { RouterProvider as ReactRouterProvider } from 'react-router'
import { router } from '../router'

export const RouterProvider = () => <ReactRouterProvider router={router} />
