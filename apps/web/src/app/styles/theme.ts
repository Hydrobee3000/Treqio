import { createTheme } from '@mui/material/styles'
import type { PaletteOptions } from '@mui/material/styles'
import { THEME_COLORS } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'

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

// ─── Палитры ──────────────────────────────────────────────────────────────────

/**
 * MUI-палитры, построенные из сырых токенов THEME_COLORS.
 */
const palettes = Object.fromEntries(
  (Object.keys(THEME_COLORS) as ThemeVariant[]).map((variant) => {
    const c = THEME_COLORS[variant]
    return [
      variant,
      {
        primary: {
          main: c.primary,
          light: c.primaryLight,
          dark: c.primaryDark,
          contrastText: c.primaryContrast,
        },
        secondary: {
          main: c.secondary,
          light: c.secondaryLight,
          dark: c.secondaryDark,
          contrastText: c.secondaryContrast,
        },
        background: { default: c.bgDefault, paper: c.bgPaper },
        text: { primary: c.textPrimary, secondary: c.textSecondary },
        divider: c.divider,
        sidebar: {
          background: c.sidebarBg,
          text: c.sidebarText,
          muted: c.sidebarMuted,
          activeBackground: c.sidebarActiveBackground,
          divider: c.sidebarDivider,
        },
      } satisfies PaletteOptions,
    ]
  }),
) as Record<ThemeVariant, PaletteOptions>

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
            border: `1px solid ${THEME_COLORS[variant].divider}`,
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
