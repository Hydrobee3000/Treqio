import { createTheme } from '@mui/material/styles'

/**
 * Цвета сайдбара — вынесены отдельно, т.к. сайдбар имеет собственный тёмный фон
 * и не вписывается в стандартную MUI palette
 */
export const sidebarColors = {
  bg:       '#243D35', // фон сайдбара
  text:     '#D8EBE4', // основной текст и иконки
  muted:    'rgba(216,235,228,0.5)', // неактивные пункты меню
  activeBg: 'rgba(255,255,255,0.09)', // фон активного/hovered пункта
  divider:  'rgba(255,255,255,0.07)', // разделительные линии
}

/**
 * Тема приложения — палитра Sage Library
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:         '#4E7B6A', // основной акцент — кнопки, ссылки, чекбоксы
      light:        '#6E9B8A', // светлый вариант для hover-состояний
      dark:         '#3D6A59', // тёмный вариант для pressed-состояний
      contrastText: '#FAFCF9', // текст поверх primary-цвета
    },
    secondary: {
      main:         '#8B7355', // вторичный акцент — теги, метки
      light:        '#A89070',
      dark:         '#6E5A40',
      contrastText: '#FAFCF9',
    },
    background: {
      default: '#F2F5F1', // фон страницы
      paper:   '#FAFCF9', // фон карточек, модалок, дропдаунов
    },
    text: {
      primary:   '#1E3328', // основной текст
      secondary: '#5A7A6A', // вспомогательный текст, подписи
    },
    divider: '#D5E4D8', // разделители между секциями
    error:   { main: '#B94040' },
    warning: { main: '#C49A3A' },
    success: { main: '#4E7B6A' },
  },

  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
  },

  shape: { borderRadius: 10 },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // убираем ALL CAPS — дефолт MUI
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
