import { baseApi } from '@/shared/api/baseApi'
import type { PublicUser } from '@/features/user'

/**
 * Друг вместе с идентификатором связи, по которому дружбу можно разорвать.
 */
export interface Friend {
  /** Идентификатор дружбы. */
  friendshipId: string
  /** Данные пользователя. */
  user: PublicUser
}

/**
 * Заявка в друзья от другого пользователя.
 */
export interface IncomingFriendRequest {
  /** Идентификатор заявки. */
  id: string
  /** Дата отправки. */
  createdAt: string
  /** Отправитель заявки. */
  sender: PublicUser
}

/**
 * Заявка в друзья, отправленная текущим пользователем.
 */
export interface OutgoingFriendRequest {
  /** Идентификатор заявки. */
  id: string
  /** Дата отправки. */
  createdAt: string
  /** Адресат заявки. */
  receiver: PublicUser
}

/**
 * API друзей и заявок в друзья.
 */
export const friendsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Список принятых друзей.
     */
    getFriends: build.query<Friend[], void>({
      query: () => '/friends',
      providesTags: ['Friend'],
    }),

    /**
     * Входящие заявки, ожидающие решения.
     */
    getIncomingRequests: build.query<IncomingFriendRequest[], void>({
      query: () => '/friends/requests/incoming',
      providesTags: ['Friend'],
    }),

    /**
     * Отправленные заявки, ожидающие ответа.
     */
    getOutgoingRequests: build.query<OutgoingFriendRequest[], void>({
      query: () => '/friends/requests/outgoing',
      providesTags: ['Friend'],
    }),

    /**
     * Отправка заявки в друзья по никнейму.
     */
    sendFriendRequest: build.mutation<void, string>({
      query: (username) => ({ url: '/friends/requests', method: 'POST', body: { username } }),
      invalidatesTags: ['Friend'],
    }),

    /**
     * Принятие входящей заявки в друзья.
     */
    acceptFriendRequest: build.mutation<void, string>({
      query: (friendshipId) => ({
        url: `/friends/requests/${friendshipId}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Friend'],
    }),

    /**
     * Отклонение заявки, отмена отправленной заявки или удаление из друзей.
     */
    removeFriendship: build.mutation<void, string>({
      query: (friendshipId) => ({ url: `/friends/${friendshipId}`, method: 'DELETE' }),
      invalidatesTags: ['Friend'],
    }),
  }),
})

export const {
  useGetFriendsQuery,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRemoveFriendshipMutation,
} = friendsApi
