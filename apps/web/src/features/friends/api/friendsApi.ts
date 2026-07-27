import { baseApi } from '@/shared/api/baseApi'

/**
 * API заявок в друзья.
 */
export const friendsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRemoveFriendshipMutation,
} = friendsApi
