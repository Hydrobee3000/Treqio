// Redux store — центральное хранилище состояния приложения.
// Все компоненты читают данные отсюда через хуки useAppSelector / useAppDispatch.
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/shared/api/baseApi'

export const store = configureStore({
  reducer: {
    // RTK Query регистрирует свой редьюсер под ключом baseApi.reducerPath ('api').
    // Он управляет кэшем запросов, статусами загрузки и ошибками.
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    // Middleware RTK Query обязателен: он управляет кэшированием,
    // инвалидацией, polling и другими фичами RTK Query.
    getDefaultMiddleware().concat(baseApi.middleware),
})

// Типы выводятся автоматически из store — не нужно описывать вручную.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
