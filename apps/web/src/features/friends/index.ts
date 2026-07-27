export {
  useGetFriendsQuery,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRemoveFriendshipMutation,
} from './api/friendsApi'
export type { Friend, IncomingFriendRequest, OutgoingFriendRequest } from './api/friendsApi'
