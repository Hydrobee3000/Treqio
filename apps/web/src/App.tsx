// Корневой компонент приложения.
// Здесь подключаются все провайдеры — обёртки которые передают
// данные (тему, стор, роутер) всему дереву компонентов ниже.
import { ThemeProvider } from './app/providers/ThemeProvider'
import { Box, Typography } from '@mui/material'

export const App = () => (
  <ThemeProvider>
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" color="primary">
        Treqio
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Track what matters
      </Typography>
    </Box>
  </ThemeProvider>
)
