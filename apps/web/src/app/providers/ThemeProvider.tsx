import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
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
  const theme = buildTheme(variant)

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
