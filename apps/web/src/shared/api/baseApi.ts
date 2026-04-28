// Базовый API-клиент на основе RTK Query.
// Все эндпоинты приложения будут инжектироваться в этот объект
// через метод .injectEndpoints() — по одному на каждый модуль (books, auth и т.д.).
// Это позволяет держать логику запросов рядом с фичей, а не в одном огромном файле.
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'api',

  // fetchBaseQuery — упрощённая обёртка над fetch.
  // baseUrl — все запросы будут относительными: /api/books, /api/auth и т.д.
  // Vite dev-сервер проксирует /api → http://localhost:4000 (настроим позже).
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    // prepareHeaders вызывается перед каждым запросом.
    // Здесь добавляем JWT-токен авторизации (реализуем позже в фиче auth).
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),

  // tagTypes — метки для кэша. RTK Query использует их для инвалидации:
  // когда мутация помечена тегом 'Book', все запросы с тегом 'Book' перезапрашиваются.
  tagTypes: ['Book', 'User', 'Feed', 'Friend'],

  // Эндпоинты добавляются через injectEndpoints в каждой фиче отдельно.
  endpoints: () => ({}),
})
