import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Check,
  ChevronDown,
  Clock,
  Search,
  SearchX,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react'
import { Collapse, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { UserRow, UserRowSkeleton } from '@/entities/user'
import {
  useAcceptFriendRequestMutation,
  useGetFriendsQuery,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useRemoveFriendshipMutation,
} from '@/features/friends'
import type { Friend } from '@/features/friends'
import { useSearchUsersQuery } from '@/features/user'
import { USERNAME_MAX } from '@/features/user/api/constraints'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { ConfirmCard } from '@/shared/ui'
import styles from './FriendsTab.module.scss'

/** Минимальная длина поискового запроса — совпадает с ограничением на backend. */
const QUERY_MIN_LENGTH = 2

/** Задержка перед запросом, чтобы не дёргать сервер на каждый символ. */
const SEARCH_DEBOUNCE_MS = 350

/**
 * Свойства CollapsibleSection.
 */
interface CollapsibleSectionProps {
  /** Заголовок секции. */
  title: string
  /** Количество записей в секции. */
  count: number
  /** Флаг раскрытого состояния при первой отрисовке. */
  defaultOpen?: boolean
  /** Содержимое секции. */
  children: ReactNode
}

/**
 * Сворачиваемая секция списка со счётчиком в заголовке.
 */
const CollapsibleSection = ({
  title,
  count,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={styles['friends__section']}>
      <button
        className={`${styles['friends__title']} ${styles['friends__title--toggle']}`}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown
          size={15}
          className={`${styles['friends__chevron']} ${open ? '' : styles['friends__chevron--collapsed']}`}
        />
        {title}
        <span className={styles['friends__count']}>{count}</span>
      </button>
      <Collapse in={open}>{children}</Collapse>
    </section>
  )
}

/**
 * Вкладка «Друзья» на своём профиле: поиск людей, список друзей и заявки.
 */
export const FriendsTab = () => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [pendingRemoval, setPendingRemoval] = useState<Friend | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const isSearching = debouncedQuery.length >= QUERY_MIN_LENGTH

  const { data: friends, isLoading: friendsLoading } = useGetFriendsQuery()
  const { data: incoming } = useGetIncomingRequestsQuery()
  const { data: outgoing } = useGetOutgoingRequestsQuery()
  const { data: found, isFetching: searching } = useSearchUsersQuery(debouncedQuery, {
    skip: !isSearching,
  })

  const [acceptRequest, { isLoading: accepting }] = useAcceptFriendRequestMutation()
  const [removeFriendship, { isLoading: removing }] = useRemoveFriendshipMutation()
  const busy = accepting || removing

  const friendList = friends ?? []
  const incomingList = incoming ?? []
  const outgoingList = outgoing ?? []
  const hasRequests = incomingList.length > 0 || outgoingList.length > 0

  // Отметки в результатах поиска считаются по уже загруженным спискам —
  // ручка поиска состояние связи не возвращает.
  const friendIds = new Set(friendList.map((friend) => friend.user.id))
  const pendingIds = new Set(outgoingList.map((request) => request.receiver.id))

  /** Имя для отображения с запасным вариантом. */
  const nameOf = (displayName: string | null, username: string | null) =>
    displayName || username || t('profile.defaultName')

  const confirmRemoval = async () => {
    if (!pendingRemoval) return
    await removeFriendship(pendingRemoval.friendshipId).unwrap()
    setPendingRemoval(null)
  }

  const searchField = (
    <div className={styles['friends__search']}>
      <Search size={16} className={query ? styles['friends__search-icon--active'] : undefined} />
      <input
        className={styles['friends__search-input']}
        type="text"
        placeholder={t('friends.searchPlaceholder')}
        value={query}
        maxLength={USERNAME_MAX}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <Tooltip title={t('friends.clearSearch')}>
          <button className={styles['friends__search-clear']} onClick={() => setQuery('')}>
            <X size={14} />
          </button>
        </Tooltip>
      )}
    </div>
  )

  if (isSearching) {
    return (
      <div className={styles['friends']}>
        {searchField}
        <div className={styles['friends__single']}>
          {searching ? (
            <div className={styles['friends__list']}>
              {[0, 1, 2].map((i) => (
                <UserRowSkeleton key={i} />
              ))}
            </div>
          ) : (found ?? []).length === 0 ? (
            <div className={styles['empty-state']}>
              <div className={styles['empty-state__icon']}>
                <SearchX size={40} />
              </div>
              <p className={styles['empty-state__text']}>
                {t('friends.noResults', { query: debouncedQuery })}
              </p>
            </div>
          ) : (
            <div className={styles['friends__list']}>
              {(found ?? []).map((user) => (
                <UserRow
                  key={user.id}
                  displayName={nameOf(user.displayName, user.username)}
                  username={user.username}
                  to={`/${user.username}`}
                  action={
                    friendIds.has(user.id) ? (
                      <Tooltip title={t('friends.alreadyFriend')}>
                        <span className={styles['friends__badge']}>
                          <UserCheck size={16} />
                        </span>
                      </Tooltip>
                    ) : pendingIds.has(user.id) ? (
                      <Tooltip title={t('friends.requestPending')}>
                        <span
                          className={`${styles['friends__badge']} ${styles['friends__badge--pending']}`}
                        >
                          <Clock size={16} />
                        </span>
                      </Tooltip>
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles['friends']}>
      {searchField}

      <div
        className={`${styles['friends__panes']} ${hasRequests ? '' : styles['friends__panes--single']}`}
      >
        <section className={`${styles['friends__section']} ${styles['friends__pane--friends']}`}>
          <h2 className={styles['friends__title']}>
            {t('friends.title')}
            {friendList.length > 0 && (
              <span className={styles['friends__count']}>{friendList.length}</span>
            )}
          </h2>

          {friendsLoading ? (
            <div className={styles['friends__list']}>
              {[0, 1].map((i) => (
                <UserRowSkeleton key={i} />
              ))}
            </div>
          ) : friendList.length === 0 ? (
            <div className={styles['empty-state']}>
              <div className={styles['empty-state__icon']}>
                <Users size={40} />
              </div>
              <p className={styles['empty-state__text']}>{t('friends.empty.title')}</p>
              <p className={styles['empty-state__sub']}>{t('friends.empty.desc')}</p>
            </div>
          ) : (
            <div className={styles['friends__list']}>
              {friendList.map((friend) => (
                <UserRow
                  key={friend.friendshipId}
                  displayName={nameOf(friend.user.displayName, friend.user.username)}
                  username={friend.user.username}
                  to={`/${friend.user.username}`}
                  action={
                    <Tooltip title={t('friends.remove')}>
                      <button
                        className={styles['friends__remove']}
                        disabled={busy}
                        onClick={() => setPendingRemoval(friend)}
                        aria-label={t('friends.remove')}
                      >
                        <UserMinus size={16} />
                      </button>
                    </Tooltip>
                  }
                />
              ))}
            </div>
          )}
        </section>

        {hasRequests && (
          <div className={styles['friends__requests']}>
            {incomingList.length > 0 && (
              <div className={styles['friends__pane--incoming']}>
                <CollapsibleSection
                  title={t('friends.incoming')}
                  count={incomingList.length}
                  defaultOpen
                >
                  <div className={styles['friends__list']}>
                    {incomingList.map((request) => (
                      <UserRow
                        key={request.id}
                        displayName={nameOf(request.sender.displayName, request.sender.username)}
                        username={request.sender.username}
                        to={`/${request.sender.username}`}
                        action={
                          <>
                            <Tooltip title={t('friends.accept')}>
                              <button
                                className={styles['friends__accept']}
                                disabled={busy}
                                onClick={() => void acceptRequest(request.id)}
                                aria-label={t('friends.accept')}
                              >
                                <Check size={16} />
                              </button>
                            </Tooltip>
                            <Tooltip title={t('friends.reject')}>
                              <button
                                className={styles['friends__reject']}
                                disabled={busy}
                                onClick={() => void removeFriendship(request.id)}
                                aria-label={t('friends.reject')}
                              >
                                <X size={16} />
                              </button>
                            </Tooltip>
                          </>
                        }
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {outgoingList.length > 0 && (
              <div className={styles['friends__pane--outgoing']}>
                <CollapsibleSection title={t('friends.outgoing')} count={outgoingList.length}>
                  <div className={styles['friends__list']}>
                    {outgoingList.map((request) => (
                      <UserRow
                        key={request.id}
                        displayName={nameOf(
                          request.receiver.displayName,
                          request.receiver.username,
                        )}
                        username={request.receiver.username}
                        to={`/${request.receiver.username}`}
                        action={
                          <Tooltip title={t('friends.cancel')}>
                            <button
                              className={styles['friends__reject']}
                              disabled={busy}
                              onClick={() => void removeFriendship(request.id)}
                              aria-label={t('friends.cancel')}
                            >
                              <X size={16} />
                            </button>
                          </Tooltip>
                        }
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmCard
        open={!!pendingRemoval}
        title={t('friends.removeConfirm.title')}
        description={t('friends.removeConfirm.desc', {
          name: pendingRemoval
            ? nameOf(pendingRemoval.user.displayName, pendingRemoval.user.username)
            : '',
        })}
        cancelLabel={t('friends.removeConfirm.cancel')}
        confirmLabel={t('friends.removeConfirm.confirm')}
        confirmColor="error"
        disabled={removing}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => void confirmRemoval()}
      />
    </div>
  )
}
