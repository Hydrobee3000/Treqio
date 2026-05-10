import { useEffect, useMemo } from 'react'
import { CssBaseline, StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material'
import type { ReactNode } from 'react'
import { useAppSelector } from '@/shared/lib/store'
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
  const variant = useAppSelector((s) => s.theme.variant)
  const theme = useMemo(() => buildTheme(variant), [variant])

  useEffect(() => {
    const root = document.documentElement
    const { sidebar, primary, divider, text, background } = theme.palette

    // Токены сайдбара и hero-секций
    root.style.setProperty('--sidebar-bg', sidebar.background)
    root.style.setProperty('--sidebar-text', sidebar.text)
    root.style.setProperty('--sidebar-muted', sidebar.muted)
    root.style.setProperty('--sidebar-divider', sidebar.divider)

    // Токены акцентного цвета и разделителей
    root.style.setProperty('--color-primary', primary.main)
    root.style.setProperty('--color-primary-dark', primary.dark)
    root.style.setProperty('--color-divider', divider)

    // Токены текста и поверхностей
    root.style.setProperty('--color-text', text.primary)
    root.style.setProperty('--color-text-2', text.secondary)
    root.style.setProperty('--color-paper', background.paper)
    root.style.setProperty('--color-paper-2', background.default)

    // Токены чипов и плиток
    root.style.setProperty('--color-chip-bg', primary.light + '33')
    root.style.setProperty('--color-chip-text', primary.dark)

    // Токены кнопок на тёмном фоне сайдбара
    root.style.setProperty('--sidebar-btn-border', sidebar.activeBackground)
    root.style.setProperty('--sidebar-btn-outlined-border', 'rgba(255,255,255,.25)')
    root.style.setProperty('--sidebar-btn-disabled-border', 'rgba(255,255,255,.15)')
    root.style.setProperty('--sidebar-btn-disabled-color', 'rgba(255,255,255,.35)')
  }, [theme, variant])

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
