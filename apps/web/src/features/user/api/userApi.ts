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

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: build.mutation<UserProfile, UpdateProfileDto>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const { useGetMeQuery, useUpdateMeMutation } = userApi
