import { AuthProvider } from './app/providers/AuthProvider'
import { I18nProvider } from './app/providers/I18nProvider'
import { RouterProvider } from './app/providers/RouterProvider'
import { StoreProvider } from './app/providers/StoreProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'

/**
 * Корневой компонент приложения.
 */
export const App = () => (
  <I18nProvider>
    {/* I18nProvider — предоставляет переводы всему дереву компонентов */}
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
  </I18nProvider>
)
