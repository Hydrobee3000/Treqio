import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/shared/api/baseApi'

/**
 * Redux store приложения
 */
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

/**
 * Тип всего состояния приложения
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * Тип dispatch со всеми зарегистрированными экшенами
 */
export type AppDispatch = typeof store.dispatch
