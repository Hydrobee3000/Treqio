// Провайдер темы — оборачивает всё приложение и передаёт тему MUI вниз по дереву.
// CssBaseline сбрасывает браузерные стили (margin, padding у body и т.д.)
// и применяет background.default из темы как фон страницы.
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import type { ReactNode } from 'react'
import { theme } from '../styles/theme'

interface Props {
  children: ReactNode
}

export const ThemeProvider = ({ children }: Props) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
)
