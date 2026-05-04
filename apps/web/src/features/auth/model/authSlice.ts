import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/entities/user'

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
}

/** Начальное состояние. */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isInitialized: false,
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
     * Очистка сессии при выходе из системы.
     */
    logout: (state) => {
      state.user = null
      state.accessToken = null
    },

    /**
     * Отметка что начальная проверка сессии завершена.
     */
    setInitialized: (state) => {
      state.isInitialized = true
    },
  },
})

export const { setCredentials, setUser, logout, setInitialized } = authSlice.actions

export default authSlice.reducer
