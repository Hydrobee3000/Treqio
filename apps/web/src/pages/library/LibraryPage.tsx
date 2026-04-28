// Страница библиотеки — основная страница приложения.
// Здесь будет список книг пользователя с фильтрами и видами отображения.
// Пока — заглушка, наполним когда будем делать фичу книг.
import { Box, Typography } from '@mui/material'

export const LibraryPage = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" color="text.primary" gutterBottom>
      Моя библиотека
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Здесь будут твои книги
    </Typography>
  </Box>
)
