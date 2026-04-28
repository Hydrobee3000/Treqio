// Тема MUI для всего приложения.
// Определяет цвета, типографику, скругления и стили компонентов.
// Подключается один раз через ThemeProvider в корне приложения.
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  // Палитра цветов — тёплая, уютная, минималистичная.
  // primary используется для кнопок, ссылок, акцентов.
  // secondary — дополнительный акцент (теги, статусы).
  palette: {
    mode: 'light',
    primary: {
      main: '#8B5E3C',
      light: '#B8845A',
      dark: '#5C3D20',
      contrastText: '#FAF6F0',
    },
    secondary: {
      main: '#6B8F71',
      light: '#90B896',
      dark: '#4A6B50',
      contrastText: '#FAF6F0',
    },
    background: {
      // default — фон страницы, paper — фон карточек и модалок
      default: '#FAF6F0',
      paper: '#FFF8F2',
    },
    text: {
      primary: '#2C1810',
      secondary: '#6B4C35',
    },
    divider: '#E8DDD0',
  },

  // Типографика: шрифт, размеры, межстрочный интервал.
  // Inter — современный шрифт, читается комфортно на экране.
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },

  // Радиус скругления углов — 10px для карточек, кнопок и т.д.
  shape: { borderRadius: 10 },

  // Переопределяем стили конкретных MUI-компонентов глобально.
  // Это позволяет не передавать одни и те же пропсы каждый раз.
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // убираем ALL CAPS который MUI ставит по умолчанию
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E8DDD0',
          boxShadow: '0px 2px 8px rgba(44, 24, 16, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
  },
})
