import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/entities/user'

const GUEST_KEY = 'treqio_guest'

/**
 * Состояние авторизации в Redux store.
 */
interface AuthState {
  /** Данные авторизованного пользователя. */
  user: User | null
  /** JWT access token для запросов к API. */
  accessToken: string | null
  /** Флаг завершения начальной проверки сессии. */
  isInitialized: boolean
  /** Пользователь вошёл как гость без регистрации. */
  isGuest: boolean
}

/** Начальное состояние — восстанавливаем гостевой режим из localStorage. */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isInitialized: false,
  isGuest: localStorage.getItem(GUEST_KEY) === 'true',
}

/**
 * Slice авторизации.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Сохранение токена и опционально данных пользователя после логина или refresh.
     */
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user?: User }>) => {
      state.accessToken = action.payload.accessToken
      state.isGuest = false
      localStorage.removeItem(GUEST_KEY)
      if (action.payload.user) {
        state.user = action.payload.user
      }
    },

    /**
     * Обновление данных пользователя после запроса /auth/me.
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },

    /**
     * Вход в гостевой режим без регистрации.
     */
    enterAsGuest: (state) => {
      state.isGuest = true
      state.user = null
      state.accessToken = null
      localStorage.setItem(GUEST_KEY, 'true')
    },

    /**
     * Очистка сессии при выходе из системы.
     */
    logout: (state) => {
      state.user = null
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

export const { setCredentials, setUser, enterAsGuest, logout, setInitialized } = authSlice.actions

export default authSlice.reducer
