import { useEffect, useMemo } from 'react'
import {
  CssBaseline,
  GlobalStyles,
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material'
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
  // Тема для «ghost»-карточек пустой библиотеки — всегда тёмная, независимо от isDark
  const ghostTheme = useMemo(() => buildTheme(darkVariant), [darkVariant])

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

    // В тёмной теме — совпадает с боковым меню (как раньше). В светлой —
    // приглушённый цвет текста (--color-text-2)
    const surfaceVariant = isDark
      ? (THEME_COLORS[activeVariant].surfaceVariant ?? sidebar.background)
      : text.secondary
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

    // Токены для ghost-карточек пустой библиотеки — все завязаны на primary тёмной темы
    // (тот же цвет, что и у акцентной карточки), просто с разной степенью прозрачности.
    const ghostPalette = ghostTheme.palette
    root.style.setProperty('--ghost-primary', ghostPalette.primary.main)
    root.style.setProperty('--ghost-chip-bg', ghostPalette.primary.light + '33') // ~20%
    root.style.setProperty('--ghost-border', ghostPalette.primary.main + '4D') // ~30%
    root.style.setProperty('--ghost-bg-1', ghostPalette.primary.light + '26') // ~15%
    root.style.setProperty('--ghost-bg-2', ghostPalette.primary.light + '0D') // ~5%

    // Лого в сайдбаре — всегда цвета тёмной темы, независимо от isDark.
    root.style.setProperty('--logo-primary', ghostPalette.primary.main)
    root.style.setProperty('--logo-primary-dark', ghostPalette.primary.dark)
  }, [theme, activeVariant, isDark, lightVariant, ghostTheme])

  return (
    <StyledEngineProvider injectFirst>
      {/* StyledEngineProvider с injectFirst гарантирует, что наши CSS-переменные и классы из SCSS будут иметь приоритет над стилями MUI. */}
      <MuiThemeProvider theme={theme}>
        {/* MuiThemeProvider предоставляет тему всем компонентам MUI внутри приложения. */}
        <CssBaseline />
        {/* Скроллбар берёт цвета из CSS-переменных темы — иначе на тёмных темах
            остаётся светлый системный скроллбар, выбивающийся из общего вида. */}
        <GlobalStyles
          styles={{
            '*': {
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--color-divider) transparent',
            },
            '*::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '*::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '*::-webkit-scrollbar-thumb': {
              background: 'var(--color-divider)',
              borderRadius: 8,
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background: 'var(--color-text-2)',
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}
