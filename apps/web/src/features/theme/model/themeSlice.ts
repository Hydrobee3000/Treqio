import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_THEME, THEME_COLORS } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'

const STORAGE_KEY = 'treqio_theme'

/**
 * Состояние темы приложения.
 */
interface ThemeState {
  /** Выбранная светлая тема. */
  lightVariant: ThemeVariant
  /** Выбранная тёмная тема. */
  darkVariant: ThemeVariant
  /** Текущий режим отображения. */
  isDark: boolean
  /** Пользователь вручную выбрал темы из разных пар (расширенный режим). */
  isCustomPair: boolean
}

function loadState(): ThemeState {
  const defaultDark = THEME_COLORS[DEFAULT_THEME].pair
  const defaults: ThemeState = {
    lightVariant: DEFAULT_THEME,
    darkVariant: defaultDark,
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
     * Автоматически устанавливает обе темы и сбрасывает кастомную пару.
     */
    setPair: (state, action: PayloadAction<ThemeVariant>) => {
      state.lightVariant = action.payload
      state.darkVariant = THEME_COLORS[action.payload].pair
      state.isCustomPair = false
      saveState({ ...state })
    },

    /**
     * Расширенный режим: только светлая тема, тёмная не меняется.
     */
    setLightVariant: (state, action: PayloadAction<ThemeVariant>) => {
      state.lightVariant = action.payload
      state.isCustomPair = action.payload !== THEME_COLORS[state.darkVariant].pair
      saveState({ ...state })
    },

    /**
     * Расширенный режим: только тёмная тема, светлая не меняется.
     */
    setDarkVariant: (state, action: PayloadAction<ThemeVariant>) => {
      state.darkVariant = action.payload
      state.isCustomPair = action.payload !== THEME_COLORS[state.lightVariant].pair
      saveState({ ...state })
    },

    /**
     * Переключение между светлым и тёмным режимом.
     */
    toggleDark: (state) => {
      state.isDark = !state.isDark
      saveState({ ...state })
    },

    /**
     * Явная установка режима (светлый/тёмный).
     */
    setDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload
      saveState({ ...state })
    },
  },
})

export const { setPair, setLightVariant, setDarkVariant, toggleDark, setDark } = themeSlice.actions
export default themeSlice.reducer
