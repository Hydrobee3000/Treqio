import { useState } from 'react'
import { ArrowLeft, BookOpen, Lock, UserX } from 'lucide-react'
import { Skeleton } from '@mui/material'
import { useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useGetUserEntriesQuery } from '@/features/book'
import {
  useAcceptFriendRequestMutation,
  useRemoveFriendshipMutation,
  useSendFriendRequestMutation,
} from '@/features/friends'
import { useGetUserProfileQuery } from '@/features/user'
import { ConfirmCard } from '@/shared/ui'
import { BooksCollection } from '@/widgets/books-collection'
import { FriendActionButton } from './ui/FriendActionButton/FriendActionButton'
import styles from './UserProfilePage.module.scss'

/**
 * Свойства UserProfilePage.
 */
interface Props {
  /** Никнейм просматриваемого пользователя. */
  username: string
}

/**
 * Страница профиля другого пользователя.
 */
export const UserProfilePage = ({ username }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: profile, isLoading, isError } = useGetUserProfileQuery(username)
  const { data: entries, isLoading: entriesLoading } = useGetUserEntriesQuery(username, {
    skip: !profile?.canViewEntries,
  })

  const [sendRequest, { isLoading: sending }] = useSendFriendRequestMutation()
  const [acceptRequest, { isLoading: accepting }] = useAcceptFriendRequestMutation()
  const [removeFriendship, { isLoading: removing }] = useRemoveFriendshipMutation()
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  const busy = sending || accepting || removing

  // Профиль могли открыть по прямой ссылке — истории для возврата тогда нет,
  // ключ начальной записи равен 'default'.
  const handleBack = () => {
    if (location.key === 'default') void navigate('/search')
    else void navigate(-1)
  }

  const handleAdd = () => {
    void sendRequest(username)
  }

  const handleAccept = () => {
    if (profile?.friendshipId) void acceptRequest(profile.friendshipId)
  }

  // Удаление из друзей подтверждается, отмена своей заявки и отклонение чужой — нет.
  const handleRemove = () => {
    if (!profile?.friendshipId) return
    if (profile.friendshipState === 'FRIENDS') {
      setConfirmRemoveOpen(true)
      return
    }
    void removeFriendship(profile.friendshipId)
  }

  const handleConfirmRemove = async () => {
    if (!profile?.friendshipId) return
    await removeFriendship(profile.friendshipId).unwrap()
    setConfirmRemoveOpen(false)
  }

  const backButton = (
    <button className={styles['back-btn']} onClick={handleBack} aria-label={t('userProfile.back')}>
      <ArrowLeft />
    </button>
  )

  if (isLoading) {
    return (
      <div className={styles['profile']}>
        <div className={styles['header']}>
          {backButton}
          <div className={styles['header__top']}>
            <Skeleton variant="circular" width={80} height={80} sx={{ flexShrink: 0 }} />
            <div className={styles['header__info']}>
              <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: '8px' }} />
              <div className={styles['header__meta']}>
                <Skeleton variant="text" width={100} sx={{ fontSize: '13px' }} />
              </div>
            </div>
            <Skeleton
              variant="rounded"
              width={140}
              height={32}
              sx={{ borderRadius: '8px', marginLeft: 'auto', alignSelf: 'flex-start' }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className={styles['profile']}>
        <div className={styles['header']}>{backButton}</div>
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <UserX size={48} />
          </div>
          <p className={styles['empty-state__text']}>{t('userProfile.notFound.title')}</p>
          <p className={styles['empty-state__sub']}>{t('userProfile.notFound.desc')}</p>
        </div>
      </div>
    )
  }

  const displayName = profile.displayName || profile.username || t('profile.defaultName')
  const avatarLetter = displayName.charAt(0).toUpperCase()
  const userEntries = entries ?? []

  return (
    <div className={styles['profile']}>
      <div className={styles['header']}>
        {backButton}
        <div className={styles['header__top']}>
          <div className={styles['avatar-placeholder']}>{avatarLetter}</div>
          <div className={styles['header__info']}>
            <h1 className={styles['header__name']}>{displayName}</h1>
            <div className={styles['header__meta']}>
              {profile.username && <span>@{profile.username}</span>}
            </div>
            {profile.bio && <p className={styles['header__bio']}>{profile.bio}</p>}
          </div>
          <FriendActionButton
            state={profile.friendshipState}
            busy={busy}
            onAdd={handleAdd}
            onAccept={handleAccept}
            onRemove={handleRemove}
          />
        </div>
      </div>

      {!profile.canViewEntries ? (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <Lock size={48} />
          </div>
          <p className={styles['empty-state__text']}>{t('userProfile.private.title')}</p>
          <p className={styles['empty-state__sub']}>{t('userProfile.private.desc')}</p>
        </div>
      ) : entriesLoading ? (
        <BooksCollection entries={[]} loading />
      ) : userEntries.length === 0 ? (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <BookOpen size={48} />
          </div>
          <p className={styles['empty-state__text']}>
            {t('userProfile.empty.title', { name: displayName })}
          </p>
        </div>
      ) : (
        <BooksCollection entries={userEntries} />
      )}

      <ConfirmCard
        open={confirmRemoveOpen}
        title={t('userProfile.removeConfirm.title')}
        description={t('userProfile.removeConfirm.desc', { name: displayName })}
        cancelLabel={t('userProfile.removeConfirm.cancel')}
        confirmLabel={t('userProfile.removeConfirm.confirm')}
        confirmColor="error"
        disabled={removing}
        onCancel={() => setConfirmRemoveOpen(false)}
        onConfirm={() => void handleConfirmRemove()}
      />
    </div>
  )
}
