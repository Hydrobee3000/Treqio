import { useState } from 'react'
import { Tooltip, useMediaQuery, useTheme } from '@mui/material'
import { BarChart3, LogIn, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useGetIncomingRequestsQuery } from '@/features/friends'
import { useGetMeQuery, useLogoutMutation } from '@/features/user'
import { logout } from '@/features/auth'
import { useGetMyEntriesQuery } from '@/features/book'
import { baseApi } from '@/shared/api/baseApi'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { EmptyState } from '@/shared/ui'
import { ProfileHeader } from '@/widgets/profile-header'
import { buildHistoryEvents, groupEventsByDay } from '../model/historyEvents'
import { EditProfileModal } from './EditProfileModal/EditProfileModal'
import { FriendsTab } from './FriendsTab/FriendsTab'
import { HistoryTimeline } from './HistoryTimeline/HistoryTimeline'
import { ProfilePageSkeleton } from './ProfilePageSkeleton/ProfilePageSkeleton'
import type { ProfileTab } from './ProfileTabs/ProfileTabs'
import { ProfileTabs } from './ProfileTabs/ProfileTabs'
import styles from './ProfilePage.module.scss'

/**
 * Страница профиля пользователя.
 */
export const ProfilePage = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const guestDisplayName = useAppSelector((s) => s.guest.displayName)
  const { data: user, isLoading } = useGetMeQuery(undefined, { skip: isGuest })
  const [logoutMutation] = useLogoutMutation()
  const { data: entries } = useGetMyEntriesQuery()
  // Счётчик на вкладке — иначе о входящих заявках не узнать, не открыв её.
  const { data: incomingRequests } = useGetIncomingRequestsQuery(undefined, { skip: isGuest })

  const defaultName = t('profile.defaultName')

  /**
   * Функция выхода из аккаунта.
   */
  const handleLogout = async () => {
    await logoutMutation()
    dispatch(logout())
    dispatch(baseApi.util.resetApiState())
    navigate('/login')
  }
  const [activeTab, setActiveTab] = useState<ProfileTab>('history')
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set())

  if (isLoading) {
    return <ProfilePageSkeleton />
  }

  /**
   * Функция переключения состояния блока событий за указанный день.
   */
  const toggleDay = (label: string) =>
    setCollapsedDays((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })

  const displayName = isGuest
    ? guestDisplayName || defaultName
    : user?.displayName || user?.username || defaultName

  const incomingCount = incomingRequests?.length ?? 0

  const todayLabel = t('profile.history.today')
  const yesterdayLabel = t('profile.history.yesterday')
  const dayGroups = groupEventsByDay(
    buildHistoryEvents(entries ?? []),
    i18n.language,
    todayLabel,
    yesterdayLabel,
  )

  const authButton = (
    <button
      className={styles['header__auth-btn']}
      onClick={isGuest ? () => navigate('/login') : handleLogout}
    >
      {isGuest ? <LogIn size={15} /> : <LogOut size={15} />}
      <span className={styles['header__auth-btn-label']}>
        {isGuest ? t('profile.login') : t('profile.logout')}
      </span>
    </button>
  )

  return (
    <div className={styles['profile']}>
      <ProfileHeader
        displayName={displayName}
        username={isGuest ? null : user?.username}
        bio={isGuest ? null : user?.bio}
        cornerAction={
          <button
            className={styles['edit-profile-btn']}
            onClick={() => setEditProfileOpen(true)}
            aria-label={t('profile.editProfile.title')}
          >
            <Settings size={14} />
          </button>
        }
        action={
          isMobile ? (
            <Tooltip title={isGuest ? t('profile.login') : t('profile.logout')}>
              {authButton}
            </Tooltip>
          ) : (
            authButton
          )
        }
      />

      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} incomingCount={incomingCount} />

      {activeTab === 'history' ? (
        <HistoryTimeline
          dayGroups={dayGroups}
          collapsedDays={collapsedDays}
          onToggleDay={toggleDay}
          language={i18n.language}
        />
      ) : activeTab === 'friends' ? (
        <FriendsTab />
      ) : (
        <EmptyState fullHeight icon={<BarChart3 size={48} />} title={t('profile.stats.empty')} />
      )}

      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        isGuest={isGuest}
        displayName={displayName}
        username={isGuest ? null : (user?.username ?? null)}
      />
    </div>
  )
}
