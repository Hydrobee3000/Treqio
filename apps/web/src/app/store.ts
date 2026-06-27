import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth'
import { guestReducer } from '@/features/guest'
import { themeReducer } from '@/features/theme'
import { layoutReducer } from '@/features/layout'
import { animationsReducer } from '@/features/animations'
import { baseApi } from '@/shared/api/baseApi'

/**
 * Redux store приложения.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    guest: guestReducer,
    theme: themeReducer,
    layout: layoutReducer,
    animations: animationsReducer,
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
