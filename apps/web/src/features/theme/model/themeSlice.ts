import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_THEME } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'

const STORAGE_KEY = 'treqio_theme'

/**
 * Состояние темы приложения.
 */
interface ThemeState {
  /** Текущий вариант палитры. */
  variant: ThemeVariant
}

/** Начальное состояние — читаем из localStorage, иначе дефолт. */
const initialState: ThemeState = {
  variant: (localStorage.getItem(STORAGE_KEY) as ThemeVariant | null) ?? DEFAULT_THEME,
}

/**
 * Slice управления темой приложения.
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Смена варианта палитры. Сохраняет выбор в localStorage.
     */
    setTheme: (state, action: PayloadAction<ThemeVariant>) => {
      state.variant = action.payload
      localStorage.setItem(STORAGE_KEY, action.payload)
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
