import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Базовый API-клиент
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  // При мутации с тегом 'Book' все запросы помеченные 'Book' автоматически перезапрашиваются
  tagTypes: ['Book', 'User', 'Feed', 'Friend'],
  endpoints: () => ({}),
})
