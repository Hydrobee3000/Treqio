import { AuthProvider } from './app/providers/AuthProvider'
import { RouterProvider } from './app/providers/RouterProvider'
import { StoreProvider } from './app/providers/StoreProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'

/**
 * Корневой компонент приложения.
 */
export const App = () => (
  <StoreProvider>
    {/* StoreProvider — предоставляет Redux store всему дереву компонентов */}
    <ThemeProvider>
      {/* ThemeProvider — применяет MUI-тему и CSS-переменные */}
      <AuthProvider>
        {/* AuthProvider — проверяет сессию пользователя при загрузке приложения */}
        <RouterProvider />
      </AuthProvider>
    </ThemeProvider>
  </StoreProvider>
)
