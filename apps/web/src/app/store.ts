import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth'
import { baseApi } from '@/shared/api/baseApi'
import themeReducer from './store/themeSlice'

/**
 * Redux store приложения.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

/**
 * Тип всего состояния приложения.
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * Тип dispatch со всеми зарегистрированными экшенами.
 */
export type AppDispatch = typeof store.dispatch
