// Корневой компонент приложения.
// Порядок провайдеров: Store → Theme → Router.
// Router идёт последним — страницы уже имеют доступ к store и теме.
import { StoreProvider } from './app/providers/StoreProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { RouterProvider } from './app/providers/RouterProvider'

export const App = () => (
  <StoreProvider>
    <ThemeProvider>
      <RouterProvider />
    </ThemeProvider>
  </StoreProvider>
)
