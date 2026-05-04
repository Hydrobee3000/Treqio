import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { logout, setCredentials } from '@/features/auth'
import type { RootState } from '@/app/store'

/** Базовый fetch с токеном из store и автоматической отправкой cookie. */
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
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
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string }
      api.dispatch(setCredentials({ accessToken }))
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
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
