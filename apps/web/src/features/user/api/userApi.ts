import { baseApi } from '@/shared/api/baseApi'

/**
 * Кому видны записи пользователя.
 */
export type EntriesVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE'

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
  /** Кому видны записи пользователя. */
  entriesVisibility: EntriesVisibility
  /** Попадает ли активность пользователя в ленты друзей. */
  shareActivity: boolean
  /** Дата создания. */
  createdAt: string
  /** Дата последнего обновления. */
  updatedAt: string
}

/**
 * Состояние связи между текущим и просматриваемым пользователем.
 */
export type FriendshipState = 'NONE' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'FRIENDS'

/**
 * Публичные данные пользователя — без email и данных OAuth-провайдера.
 */
export interface PublicUser {
  /** Уникальный идентификатор пользователя. */
  id: string
  /** Уникальный никнейм. */
  username: string | null
  /** Отображаемое имя. */
  displayName: string | null
  /** URL аватара. */
  avatarUrl: string | null
  /** Краткое описание профиля. */
  bio: string | null
  /** Кому видны записи пользователя. */
  entriesVisibility: EntriesVisibility
  /** Дата регистрации. */
  createdAt: string
}

/**
 * Профиль другого пользователя вместе с состоянием связи с ним.
 */
export interface PublicProfile extends PublicUser {
  /** Состояние связи с текущим пользователем. */
  friendshipState: FriendshipState
  /** Идентификатор заявки — null, если связи нет. */
  friendshipId: string | null
  /** Флаг доступности записей текущему пользователю. */
  canViewEntries: boolean
}

/**
 * Данные для обновления профиля пользователя.
 */
export interface UpdateProfileDto {
  /** Отображаемое имя. */
  displayName?: string | undefined
  /** Уникальный никнейм. */
  username?: string | undefined
  /** Краткое описание профиля. */
  bio?: string | undefined
  /** Кому видны записи пользователя. */
  entriesVisibility?: EntriesVisibility | undefined
  /** Попадает ли активность пользователя в ленты друзей. */
  shareActivity?: boolean | undefined
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
     * Получение профиля другого пользователя по никнейму.
     */
    getUserProfile: build.query<PublicProfile, string>({
      query: (username) => `/users/${username}`,
      // Тег Friend — действия с заявками меняют состояние связи в этом же ответе.
      providesTags: ['Friend'],
    }),
    /**
     * Поиск пользователей по никнейму и отображаемому имени.
     */
    searchUsers: build.query<PublicUser[], string>({
      query: (q) => ({ url: '/users/search', params: { q } }),
    }),
    /**
     * Выход из системы.
     */
    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
})

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetUserProfileQuery,
  useSearchUsersQuery,
  useLogoutMutation,
} = userApi
