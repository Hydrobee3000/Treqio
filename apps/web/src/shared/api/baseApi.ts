import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { logout, setCredentials } from '@/features/auth'
import type { RootState } from '@/app/store'

// В проде web и api на разных доменах — адрес api приходит из переменной
// окружения, инлайнится в бандл на этапе сборки. Локально переменная не
// задана, и запросы идут через прокси Vite на относительный путь /api.
const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '/api'

/** Базовый fetch с токеном из store и автоматической отправкой cookie. */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include', // отправляет httpOnly cookie с refresh token автоматически
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

/**
 * Базовый запрос с автоматическим обновлением access token при 401.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const { accessToken } = (api.getState() as RootState).auth

  // если гость — возвращаем пустой результат без ошибки
  if (!accessToken) {
    return { data: null }
  }

  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      const { accessToken: newToken } = refreshResult.data as { accessToken: string }
      api.dispatch(setCredentials({ accessToken: newToken }))
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
      api.dispatch(baseApi.util.resetApiState())
    }
  }

  return result
}

/**
 * Базовый API-клиент.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Book', 'User', 'Feed', 'Friend'],
  endpoints: () => ({}),
})
