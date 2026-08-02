import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export const GUEST_KEY = 'treqio_guest'

/**
 * Состояние авторизации в Redux store.
 */
interface AuthState {
  /** JWT access token для запросов к API. */
  accessToken: string | null
  /** Флаг завершения начальной проверки сессии. */
  isInitialized: boolean
  /** Пользователь вошёл как гость без регистрации. */
  isGuest: boolean
}

/** Начальное состояние — восстанавливаем гостевой режим из localStorage. */
function loadAuthState(): AuthState {
  return {
    accessToken: null,
    isInitialized: false,
    isGuest: localStorage.getItem(GUEST_KEY) === 'true',
  }
}

/**
 * Slice авторизации.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthState,
  reducers: {
    /**
     * Сохранение токена после логина или refresh.
     */
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken
      state.isGuest = false
      localStorage.removeItem(GUEST_KEY)
    },

    /**
     * Вход в гостевой режим без регистрации.
     */
    enterAsGuest: (state) => {
      state.isGuest = true
      state.accessToken = null
      localStorage.setItem(GUEST_KEY, 'true')
    },

    /**
     * Очистка сессии при выходе из системы.
     */
    logout: (state) => {
      state.accessToken = null
      state.isGuest = false
      localStorage.removeItem(GUEST_KEY)
    },

    /**
     * Отметка что начальная проверка сессии завершена.
     */
    setInitialized: (state) => {
      state.isInitialized = true
    },
  },
})

export const { setCredentials, enterAsGuest, logout, setInitialized } = authSlice.actions

export default authSlice.reducer
