import { useEffect, useMemo } from 'react'
import { CssBaseline, StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material'
import type { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setDark } from '@/features/theme'
import { THEME_COLORS } from '@/shared/config/themes'
import { buildTheme } from '../styles/theme'

/**
 * Свойства провайдера темы.
 */
interface Props {
  /** Дочерние компоненты с доступом к теме. */
  children: ReactNode
}

/**
 * Оборачивает приложение MUI ThemeProvider с текущей темой из store.
 */
export const ThemeProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch()
  const { lightVariant, darkVariant, isDark, themeMode } = useAppSelector((s) => s.theme)
  const activeVariant = isDark ? darkVariant : lightVariant
  const theme = useMemo(() => buildTheme(activeVariant), [activeVariant])

  // Следим за системной темой когда выбран режим «Как на устройстве»
  useEffect(() => {
    if (themeMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    dispatch(setDark(mq.matches))
    const handler = (e: MediaQueryListEvent) => dispatch(setDark(e.matches))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themeMode, dispatch])

  useEffect(() => {
    const root = document.documentElement
    const { sidebar, primary, warning, divider, text, background } = theme.palette

    // Токены активной темы — используются во всём приложении
    root.style.setProperty('--sidebar-bg', sidebar.background)
    root.style.setProperty('--sidebar-text', sidebar.text)
    root.style.setProperty('--sidebar-muted', sidebar.muted)
    root.style.setProperty('--sidebar-divider', sidebar.divider)

    root.style.setProperty('--color-primary', primary.main)
    root.style.setProperty('--color-primary-dark', primary.dark)
    root.style.setProperty('--color-divider', divider)

    root.style.setProperty('--color-text', text.primary)
    root.style.setProperty('--color-text-2', text.secondary)
    root.style.setProperty('--color-paper', background.paper)
    root.style.setProperty('--color-paper-2', background.default)

    root.style.setProperty('--color-warning', warning.main)
    root.style.setProperty('--color-warning-bg', warning.main + '26') // 15% opacity
    root.style.setProperty('--color-warning-border', warning.main + '59') // 35% opacity

    root.style.setProperty('--color-chip-bg', primary.light + '33')
    root.style.setProperty('--color-chip-text', primary.dark)

    root.style.setProperty('--header-title-color', isDark ? sidebar.text : sidebar.background)

    const surfaceVariant = THEME_COLORS[activeVariant].surfaceVariant ?? sidebar.background
    root.style.setProperty('--color-surface-variant', surfaceVariant)

    root.style.setProperty('--sidebar-btn-border', sidebar.activeBackground)
    root.style.setProperty('--sidebar-btn-outlined-border', 'rgba(255,255,255,.25)')
    root.style.setProperty('--sidebar-btn-disabled-border', 'rgba(255,255,255,.15)')
    root.style.setProperty('--sidebar-btn-disabled-color', 'rgba(255,255,255,.35)')

    // Токены для страницы входа — всегда из светлой темы, не зависят от isDark.
    // Это гарантирует что login page выглядит одинаково при любом режиме.
    const lightColors = THEME_COLORS[lightVariant]
    root.style.setProperty('--login-hero-bg', lightColors.sidebarBg)
    root.style.setProperty('--login-hero-text', lightColors.sidebarText)
    root.style.setProperty('--login-hero-muted', lightColors.sidebarMuted)
  }, [theme, activeVariant, isDark, lightVariant])

  return (
    <StyledEngineProvider injectFirst>
      {/* StyledEngineProvider с injectFirst гарантирует, что наши CSS-переменные и классы из SCSS будут иметь приоритет над стилями MUI. */}
      <MuiThemeProvider theme={theme}>
        {/* MuiThemeProvider предоставляет тему всем компонентам MUI внутри приложения. */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}
