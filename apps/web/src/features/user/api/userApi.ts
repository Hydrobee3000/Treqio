import { baseApi } from '@/shared/api/baseApi'

/**
 * Профиль пользователя, возвращаемый API.
 */
export interface UserProfile {
  /** Уникальный идентификатор пользователя. */
  id: string
  /** Email адрес. */
  email: string
  /** Отображаемое имя. */
  displayName: string | null
  /** Уникальный никнейм. */
  username: string | null
  /** Краткое описание профиля. */
  bio: string | null
  /** URL аватара. */
  avatarUrl: string | null
  /** Публичность профиля. */
  isPublic: boolean
  /** Дата создания. */
  createdAt: string
  /** Дата последнего обновления. */
  updatedAt: string
}

/**
 * Данные для обновления профиля пользователя.
 */
export interface UpdateProfileDto {
  /** Отображаемое имя. */
  displayName?: string
  /** Уникальный никнейм. */
  username?: string
  /** Краткое описание профиля. */
  bio?: string
  /** Публичность профиля. */
  isPublic?: boolean
}

/**
 * API пользователя.
 */
export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Получение профиля текущего пользователя.
     */
    getMe: build.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    /**
     * Обновление профиля текущего пользователя.
     */
    updateMe: build.mutation<UserProfile, UpdateProfileDto>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    /**
     * Выход из системы.
     */
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
})

export const { useGetMeQuery, useUpdateMeMutation, useLogoutMutation } = userApi
