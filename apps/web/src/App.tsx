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
