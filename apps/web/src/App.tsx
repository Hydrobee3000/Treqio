// Корневой компонент приложения.
// Провайдеры вложены в порядке: Store → Theme → остальное приложение.
// Store снаружи Theme — чтобы в будущем можно было читать тему из store если понадобится.
import { StoreProvider } from './app/providers/StoreProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { Box, Typography } from '@mui/material'

export const App = () => (
  <StoreProvider>
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
  </StoreProvider>
)
