// Тема MUI для всего приложения.
// Определяет цвета, типографику, скругления и стили компонентов.
// Подключается один раз через ThemeProvider в корне приложения.
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  // Палитра: Sage Library — природная, спокойная, зелёная.
  palette: {
    mode: 'light',
    primary: {
      main: '#4E7B6A',
      light: '#6E9B8A',
      dark: '#3D6A59',
      contrastText: '#FAFCF9',
    },
    secondary: {
      main: '#8B7355',
      light: '#A89070',
      dark: '#6E5A40',
      contrastText: '#FAFCF9',
    },
    background: {
      // default — фон страницы, paper — фон карточек и модалок
      default: '#F2F5F1',
      paper: '#FAFCF9',
    },
    text: {
      primary: '#1E3328',
      secondary: '#5A7A6A',
    },
    divider: '#D5E4D8',
    error:   { main: '#B94040' },
    warning: { main: '#C49A3A' },
    success: { main: '#4E7B6A' },
  },

  // Типографика: шрифт Inter, комфортный межстрочный интервал.
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },

  shape: { borderRadius: 10 },

  // Глобальные переопределения стилей MUI-компонентов.
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // убираем ALL CAPS по умолчанию
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #D5E4D8',
          boxShadow: '0px 2px 8px rgba(30,51,40,0.07)',
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
