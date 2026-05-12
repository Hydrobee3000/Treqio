import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_THEME, THEME_COLORS } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'

const STORAGE_KEY = 'treqio_theme'

export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Состояние темы приложения.
 */
interface ThemeState {
  /** Выбранная светлая тема. */
  lightVariant: ThemeVariant
  /** Выбранная тёмная тема. */
  darkVariant: ThemeVariant
  /** Текущий активный режим (light/dark/system). */
  themeMode: ThemeMode
  /** Вычисленный флаг тёмного режима — управляется themeMode и ОС при system. */
  isDark: boolean
  /** Пользователь вручную выбрал темы из разных пар (расширенный режим). */
  isCustomPair: boolean
}

function loadState(): ThemeState {
  const defaultDark = THEME_COLORS[DEFAULT_THEME].pair
  const defaults: ThemeState = {
    lightVariant: DEFAULT_THEME,
    darkVariant: defaultDark,
    themeMode: 'light',
    isDark: false,
    isCustomPair: false,
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.lightVariant && parsed.darkVariant) return parsed as ThemeState
    }
  } catch {
    // ignore parse errors, fall back to defaults
  }
  return defaults
}

function saveState(state: ThemeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: loadState,
  reducers: {
    /**
     * Простой режим: выбор пары целиком по светлой теме.
     */
    setPair: (state, action: PayloadAction<ThemeVariant>) => {
      state.lightVariant = action.payload
      state.darkVariant = THEME_COLORS[action.payload].pair
      state.isCustomPair = false
      saveState({ ...state })
    },

    /**
     * Расширенный режим: только светлая тема.
     */
    setLightVariant: (state, action: PayloadAction<ThemeVariant>) => {
      state.lightVariant = action.payload
      state.isCustomPair = action.payload !== THEME_COLORS[state.darkVariant].pair
      saveState({ ...state })
    },

    /**
     * Расширенный режим: только тёмная тема.
     */
    setDarkVariant: (state, action: PayloadAction<ThemeVariant>) => {
      state.darkVariant = action.payload
      state.isCustomPair = action.payload !== THEME_COLORS[state.lightVariant].pair
      saveState({ ...state })
    },

    /**
     * Выбор режима темы: светлая / тёмная / системная.
     * При system isDark будет обновлён ThemeProvider через prefers-color-scheme.
     */
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload
      if (action.payload === 'light') state.isDark = false
      if (action.payload === 'dark') state.isDark = true
      saveState({ ...state })
    },

    /**
     * Переключение light/dark — выходит из системного режима.
     */
    toggleDark: (state) => {
      state.isDark = !state.isDark
      state.themeMode = state.isDark ? 'dark' : 'light'
      saveState({ ...state })
    },

    /**
     * Прямая установка isDark — используется ThemeProvider для системного режима.
     */
    setDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload
      saveState({ ...state })
    },
  },
})

export const { setPair, setLightVariant, setDarkVariant, setThemeMode, toggleDark, setDark } =
  themeSlice.actions
export default themeSlice.reducer
