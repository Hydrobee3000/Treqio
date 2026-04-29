import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import type { ReactNode } from 'react'
import { theme } from '../styles/theme'

interface Props {
  /**
   * Дерево компонентов с доступом к теме
   */
  children: ReactNode
}

/**
 * Оборачивает приложение MUI ThemeProvider и сбрасывает браузерные стили через CssBaseline
 */
export const ThemeProvider = ({ children }: Props) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
)
