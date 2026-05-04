import { AuthProvider } from './app/providers/AuthProvider'
import { RouterProvider } from './app/providers/RouterProvider'
import { StoreProvider } from './app/providers/StoreProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'

export const App = () => (
  <StoreProvider>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider />
      </AuthProvider>
    </ThemeProvider>
  </StoreProvider>
)
