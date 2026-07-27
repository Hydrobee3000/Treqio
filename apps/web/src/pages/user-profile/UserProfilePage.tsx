import { useState } from 'react'
import { ArrowLeft, BookOpen, Lock, UserX } from 'lucide-react'
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
import { ProfileHeader, ProfileHeaderSkeleton } from '@/widgets/profile-header'
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
        <ProfileHeaderSkeleton actionWidth={140} className={styles['header-spacing']} />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className={styles['profile']}>
        <div className={styles['header-fallback']}>{backButton}</div>
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
  const userEntries = entries ?? []

  return (
    <div className={styles['profile']}>
      <ProfileHeader
        displayName={displayName}
        username={profile.username}
        bio={profile.bio}
        className={styles['header-spacing']}
        cornerAction={backButton}
        action={
          <FriendActionButton
            state={profile.friendshipState}
            busy={busy}
            onAdd={handleAdd}
            onAccept={handleAccept}
            onRemove={handleRemove}
          />
        }
      />

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
