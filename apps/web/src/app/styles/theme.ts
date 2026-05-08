import { createTheme } from '@mui/material/styles'

/**
 * Расширяем MUI Palette своими токенами.
 * После этого theme.palette.sidebar.* доступен везде с типизацией.
 */
declare module '@mui/material/styles' {
  /**
   * Расширяет тип palette — добавляет доступ к theme.palette.sidebar.*.
   */
  interface Palette {
    sidebar: SidebarPalette
  }
  /**
   * Расширяет тип опций createTheme — позволяет передавать sidebar при создании темы.
   */
  interface PaletteOptions {
    sidebar?: Partial<SidebarPalette>
  }
}

/**
 * Цвета тёмного сайдбара и hero-секций.
 */
interface SidebarPalette {
  /** Фон сайдбара. */
  bg: string
  /** Основной текст и иконки. */
  text: string
  /** Неактивные пункты меню. */
  muted: string
  /** Фон активного / hovered пункта. */
  activeBg: string
  /** Разделительные линии. */
  divider: string
}

/**
 * Тема приложения — палитра Sage Library.
 */
export const theme = createTheme({
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
      default: '#F2F5F1',
      paper: '#FAFCF9',
    },
    text: {
      primary: '#1E3328',
      secondary: '#5A7A6A',
    },
    divider: '#D5E4D8',
    error: { main: '#B94040' },
    warning: { main: '#C49A3A' },
    success: { main: '#4E7B6A' },

    sidebar: {
      bg: '#243D35',
      text: '#D8EBE4',
      muted: 'rgba(216,235,228,0.5)',
      activeBg: 'rgba(255,255,255,0.09)',
      divider: 'rgba(255,255,255,0.07)',
    },
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
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
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
