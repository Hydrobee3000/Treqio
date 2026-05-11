import { createTheme } from '@mui/material/styles'
import type { PaletteOptions, SimplePaletteColorOptions } from '@mui/material/styles'

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

// ─── Типы ─────────────────────────────────────────────────────────────────────

/**
 * Цвета тёмного сайдбара и hero-секций.
 */
interface SidebarPalette {
  /** Фон сайдбара. */
  background: string
  /** Основной текст и иконки. */
  text: string
  /** Неактивные пункты меню. */
  muted: string
  /** Фон активного / hovered пункта. */
  activeBackground: string
  /** Разделительные линии. */
  divider: string
}

/**
 * Доступные варианты темы приложения.
 */
export type ThemeVariant = 'sageLibrary' | 'warmLatte' | 'slate' | 'dustyPlum'

// ─── Палитры ──────────────────────────────────────────────────────────────────

/**
 * Токены каждого варианта темы.
 */
const palettes: Record<ThemeVariant, PaletteOptions> = {
  sageLibrary: {
    primary: {
      main: '#4E7B6A', // основной акцент
      light: '#6E9B8A', // светлый вариант для hover
      dark: '#3D6A59', // тёмный вариант для pressed
      contrastText: '#FAFCF9', // цвет текста на primary-кнопках
    },
    secondary: {
      main: '#8B7355', // вторичный акцент
      light: '#A89070', // светлый вариант
      dark: '#6E5A40', // тёмный вариант
      contrastText: '#FAFCF9', // цвет текста на secondary-кнопках
    },
    background: {
      default: '#F2F5F1', // фон страницы
      paper: '#FAFCF9', // фон карточек и поверхностей
    },
    text: {
      primary: '#1E3328', // основной текст
      secondary: '#5A7A6A', // вспомогательный текст
    },
    divider: '#D5E4D8', // разделители между секциями
    sidebar: {
      background: '#243D35', // фон сайдбара
      text: '#D8EBE4', // текст и иконки
      muted: 'rgba(216,235,228,0.5)', // неактивные пункты меню
      activeBackground: 'rgba(255,255,255,0.09)', // фон активного пункта
      divider: 'rgba(255,255,255,0.07)', // разделительные линии
    },
  },

  warmLatte: {
    primary: { main: '#8B5E3C', light: '#A87D5A', dark: '#7A5234', contrastText: '#FFF8F2' },
    secondary: { main: '#7A5C45', light: '#9A7A62', dark: '#5E4432', contrastText: '#FFF8F2' },
    background: { default: '#FAF6F0', paper: '#FFF8F2' },
    text: { primary: '#2C1810', secondary: '#7A5C45' },
    divider: '#E8DDD0',
    sidebar: {
      background: '#2C1810',
      text: '#E8DDD0',
      muted: 'rgba(232,221,208,0.5)',
      activeBackground: 'rgba(255,255,255,0.10)',
      divider: 'rgba(255,255,255,0.07)',
    },
  },

  slate: {
    primary: { main: '#4361B0', light: '#6481C8', dark: '#3451A0', contrastText: '#FFFFFF' },
    secondary: { main: '#5A6580', light: '#7A85A0', dark: '#3A4560', contrastText: '#FFFFFF' },
    background: { default: '#F7F8FA', paper: '#FFFFFF' },
    text: { primary: '#1A2035', secondary: '#5A6580' },
    divider: '#E2E6EF',
    sidebar: {
      background: '#1E2535',
      text: '#CBD5E8',
      muted: 'rgba(203,213,232,0.5)',
      activeBackground: 'rgba(255,255,255,0.08)',
      divider: 'rgba(255,255,255,0.07)',
    },
  },

  dustyPlum: {
    primary: { main: '#7C5CA8', light: '#9C7CC8', dark: '#6B4C97', contrastText: '#FFFFFF' },
    secondary: { main: '#6B5880', light: '#8B78A0', dark: '#4B3860', contrastText: '#FFFFFF' },
    background: { default: '#F6F4FA', paper: '#FDFBFF' },
    text: { primary: '#1E1530', secondary: '#6B5880' },
    divider: '#E3DCF0',
    sidebar: {
      background: '#2D1F45',
      text: '#DDD5EE',
      muted: 'rgba(221,213,238,0.5)',
      activeBackground: 'rgba(255,255,255,0.09)',
      divider: 'rgba(255,255,255,0.07)',
    },
  },
}

// ─── Фабрика ──────────────────────────────────────────────────────────────────

/**
 * Создаёт MUI тему для заданного варианта палитры.
 */
export function buildTheme(variant: ThemeVariant) {
  return createTheme({
    palette: {
      mode: 'light',
      ...palettes[variant],
      error: { main: '#B94040' },
      warning: { main: '#C49A3A' },
      success: palettes[variant].primary,
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
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${palettes[variant].divider}`,
            boxShadow: '0px 2px 8px rgba(0,0,0,0.07)',
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
    },
  })
}

/** Дефолтная тема приложения. */
export const DEFAULT_THEME: ThemeVariant = 'sageLibrary'

/**
 * Отображаемые названия вариантов темы.
 */
const THEME_NAMES: Record<ThemeVariant, string> = {
  sageLibrary: 'Sage Library',
  warmLatte: 'Warm Latte',
  slate: 'Slate',
  dustyPlum: 'Dusty Plum',
}

/**
 * Метаданные тем для UI выбора темы — цвета берутся из palettes.
 */
export const THEMES_META = (Object.keys(palettes) as ThemeVariant[]).map((variant) => {
  const p = palettes[variant]
  return {
    variant,
    name: THEME_NAMES[variant],
    sidebarColor: p.sidebar!.background!,
    primaryColor: (p.primary as SimplePaletteColorOptions).main,
    bgColor: p.background!.default!,
  }
})
