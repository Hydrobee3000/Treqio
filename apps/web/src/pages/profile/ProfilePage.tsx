import { useState } from 'react'
import { Collapse, Skeleton, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  History,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  Star,
  Users,
  X,
} from 'lucide-react'
import type { ComponentType, CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { STATUS_TEXT_COLOR, ScoreBadge } from '@/entities/book'
import type { BookEntry, BookStatus } from '@/entities/book'
import { useGetIncomingRequestsQuery } from '@/features/friends'
import { useGetMeQuery, useLogoutMutation } from '@/features/user'
import { logout } from '@/features/auth'
import { useGetMyEntriesQuery } from '@/features/book'
import { baseApi } from '@/shared/api/baseApi'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { ProfileHeader, ProfileHeaderSkeleton } from '@/widgets/profile-header'
import { EditProfileModal } from './ui/EditProfileModal/EditProfileModal'
import { FriendsTab } from './ui/FriendsTab/FriendsTab'
import styles from './ProfilePage.module.scss'

/** Вкладка страницы профиля. */
type ProfileTab = 'history' | 'stats' | 'friends'

/** Тип события в истории — выводится из текущих полей записи, без отдельного журнала действий. */
type HistoryEventType = 'ADDED' | 'READING' | 'DONE' | 'DROPPED' | 'RATED' | 'STATUS'

/**
 * Событие истории — производное от одной записи BookEntry на конкретную дату.
 */
interface HistoryEvent {
  /** Тип события. */
  type: HistoryEventType
  /** Дата события (ISO). */
  date: string
  /** Запись, на основе которой построено событие. */
  entry: BookEntry
}

/** Группа событий за один день — с готовым лейблом («Сегодня», «Вчера» или дата). */
interface HistoryDayGroup {
  /** Лейбл дня. */
  label: string
  /** События за этот день, от новых к старым. */
  events: HistoryEvent[]
}

/** Иконка узла на таймлайне для каждого типа события. */
const HISTORY_ICON: Record<HistoryEventType, ComponentType<{ size?: number }>> = {
  ADDED: Plus,
  READING: ArrowRight,
  DONE: Check,
  DROPPED: X,
  RATED: Star,
  STATUS: RefreshCw,
}

/** Пилюля статуса в тексте события. */
function StatusChip({ status }: { status: BookStatus }) {
  const { t } = useTranslation()
  const color = STATUS_TEXT_COLOR[status]
  return (
    <span
      className={styles['history__status-chip']}
      style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      {t(`book.status.${status}`)}
    </span>
  )
}

/** Фраза-действие события — акцентное слово цветом события, связки серым. */
function VerbPhrase({ type }: { type: HistoryEventType }) {
  const { t } = useTranslation()
  const prefix = t(`profile.history.verbs.${type}_prefix`, { defaultValue: '' })
  const highlight = t(`profile.history.verbs.${type}_highlight`)
  const suffix = t(`profile.history.verbs.${type}_suffix`, { defaultValue: '' })

  return (
    <>
      {prefix && <span className={styles['history__filler']}>{prefix}</span>}
      {prefix && ' '}
      <span className={styles[`history__verb--${type.toLowerCase()}`]}>{highlight}</span>
      {suffix && ' '}
      {suffix && <span className={styles['history__filler']}>{suffix}</span>}
    </>
  )
}

/** Оценку изменили не в момент завершения книги — нужно отдельное событие. */
function hasSeparateRatingEvent(entry: BookEntry): boolean {
  return !!entry.ratingUpdatedAt && entry.ratingUpdatedAt !== entry.finishDate
}

/**
 * Статус менялся в момент, не совпадающий с startDate/finishDate (например
 * откатили «Прочитано» обратно на «Читаю») — такой переход событиями
 * READING/DONE/DROPPED не покрывается, нужно отдельное общее событие.
 */
function hasSeparateStatusEvent(entry: BookEntry): boolean {
  if (!entry.statusUpdatedAt) return false
  if (entry.statusUpdatedAt === entry.startDate) return false
  if (entry.statusUpdatedAt === entry.finishDate) return false
  return entry.status !== 'DROPPED'
}

/**
 * Книга создана сразу со статусом «Читаю»/«Прочитано»/«Брошено» — рядом есть
 * событие (начал читать/прочитал/забросил) с той же датой, оно уже называет
 * статус, поэтому «со статусом X» в тексте добавления было бы дублированием.
 */
function hasAccompanyingCreationEvent(entry: BookEntry): boolean {
  if (entry.startDate === entry.createdAt) return true
  if (entry.finishDate === entry.createdAt) return true
  if (
    entry.status === 'DROPPED' &&
    (entry.statusUpdatedAt ?? entry.createdAt) === entry.createdAt
  ) {
    return true
  }
  return false
}

/**
 * Порядок событий при одинаковой дате (книга создана сразу со статусом
 * «Читаю»/«Прочитано» — даты совпадают до миллисекунды) — более «продвинутое»
 * по читательскому пути событие показывается выше, как более актуальное.
 */
const HISTORY_TYPE_RANK: Record<HistoryEventType, number> = {
  ADDED: 0,
  READING: 1,
  DONE: 2,
  DROPPED: 2,
  RATED: 3,
  STATUS: 3,
}

/** Строит события истории из текущих полей записей — без отдельного журнала действий. */
function buildHistoryEvents(entries: BookEntry[]): HistoryEvent[] {
  const events: HistoryEvent[] = []
  for (const entry of entries) {
    events.push({ type: 'ADDED', date: entry.createdAt, entry })
    if (entry.startDate) events.push({ type: 'READING', date: entry.startDate, entry })
    if (entry.finishDate) events.push({ type: 'DONE', date: entry.finishDate, entry })
    if (entry.status === 'DROPPED') {
      events.push({ type: 'DROPPED', date: entry.statusUpdatedAt ?? entry.createdAt, entry })
    }
    if (hasSeparateRatingEvent(entry)) {
      events.push({ type: 'RATED', date: entry.ratingUpdatedAt as string, entry })
    }
    if (hasSeparateStatusEvent(entry)) {
      events.push({ type: 'STATUS', date: entry.statusUpdatedAt as string, entry })
    }
  }
  return events.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    return HISTORY_TYPE_RANK[b.type] - HISTORY_TYPE_RANK[a.type]
  })
}

/** Лейбл дня события — «Сегодня», «Вчера» или дата в локализованном формате. */
function formatDayLabel(dateStr: string, lang: string, today: string, yesterday: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const prev = new Date(now)
  prev.setDate(now.getDate() - 1)
  if (date.toDateString() === now.toDateString()) return today
  if (date.toDateString() === prev.toDateString()) return yesterday
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
  })
}

/** Группирует отсортированные по дате события по дням. */
function groupEventsByDay(
  events: HistoryEvent[],
  lang: string,
  today: string,
  yesterday: string,
): HistoryDayGroup[] {
  const groups: HistoryDayGroup[] = []
  for (const event of events) {
    const label = formatDayLabel(event.date, lang, today, yesterday)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.label === label) lastGroup.events.push(event)
    else groups.push({ label, events: [event] })
  }
  return groups
}

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
    return (
      <div className={styles['profile']}>
        <ProfileHeaderSkeleton actionWidth={76} />

        <div className={styles['tabs']}>
          <button className={`${styles['tab']} ${styles['tab--active']}`}>
            <History size={17} />
            {t('profile.tabs.history')}
          </button>
          <button className={styles['tab']}>
            <BarChart3 size={17} />
            {t('profile.tabs.stats')}
          </button>
        </div>

        <div className={styles['history']}>
          {[3, 2].map((count, gi) => (
            <div key={gi} className={styles['history__day']}>
              <Skeleton variant="rounded" className={styles['history__date-skeleton']} />
              <div className={styles['history__timeline']}>
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className={styles['history__event']}>
                    <Skeleton variant="circular" className={styles['history__node-skeleton']} />
                    <div className={styles['history__body']}>
                      <Skeleton
                        variant="text"
                        className={styles['history__text-skeleton']}
                        style={{ '--skeleton-width': `${130 + i * 30}px` } as CSSProperties}
                      />
                    </div>
                    <Skeleton variant="text" className={styles['history__time-skeleton']} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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

      <div className={styles['tabs']}>
        <button
          className={`${styles['tab']} ${activeTab === 'history' ? styles['tab--active'] : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={17} />
          {t('profile.tabs.history')}
        </button>
        {/* У гостя нет учётной записи на сервере, а значит и друзей */}
        {!isGuest && (
          <button
            className={`${styles['tab']} ${activeTab === 'friends' ? styles['tab--active'] : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={17} />
            {t('profile.tabs.friends')}
            {incomingCount > 0 && <span className={styles['tab__badge']}>{incomingCount}</span>}
          </button>
        )}
        <button
          className={`${styles['tab']} ${activeTab === 'stats' ? styles['tab--active'] : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={17} />
          {t('profile.tabs.stats')}
        </button>
      </div>

      {activeTab === 'history' ? (
        dayGroups.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-state__icon']}>
              <History size={48} />
            </div>
            <p className={styles['empty-state__text']}>{t('profile.history.empty.title')}</p>
            <p className={styles['empty-state__sub']}>{t('profile.history.empty.desc')}</p>
          </div>
        ) : (
          <div className={styles['history']}>
            {dayGroups.map((group) => {
              const collapsed = collapsedDays.has(group.label)
              return (
                <div key={group.label} className={styles['history__day']}>
                  <div className={styles['history__date']} onClick={() => toggleDay(group.label)}>
                    {group.label}
                    <ChevronDown
                      size={14}
                      className={`${styles['history__date-chevron']} ${collapsed ? styles['history__date-chevron--collapsed'] : ''}`}
                    />
                  </div>
                  <Collapse in={!collapsed}>
                    <div className={styles['history__timeline']}>
                      {group.events.map((event, i) => {
                        const Icon = HISTORY_ICON[event.type]
                        const { rating } = event.entry
                        const showsRating =
                          rating !== null &&
                          ((event.type === 'DONE' && !hasSeparateRatingEvent(event.entry)) ||
                            event.type === 'RATED')
                        return (
                          <div
                            key={`${event.entry.id}-${event.type}-${i}`}
                            className={styles['history__event']}
                          >
                            <div
                              className={`${styles['history__node']} ${styles[`history__node--${event.type.toLowerCase()}`]}`}
                            >
                              <Icon size={14} />
                            </div>
                            <div className={styles['history__body']}>
                              <p className={styles['history__text']}>
                                <VerbPhrase type={event.type} />{' '}
                                <strong>«{event.entry.book.title}»</strong>
                                {event.type === 'ADDED' &&
                                  !hasAccompanyingCreationEvent(event.entry) && (
                                    <>
                                      {' '}
                                      <span className={styles['history__filler']}>
                                        {t('profile.history.withStatus')}
                                      </span>{' '}
                                      <StatusChip status={event.entry.status} />
                                    </>
                                  )}
                                {event.type === 'STATUS' && (
                                  <>
                                    {' '}
                                    <span className={styles['history__filler']}>
                                      {t('profile.history.on')}
                                    </span>{' '}
                                    <StatusChip status={event.entry.status} />
                                  </>
                                )}
                                {showsRating && rating !== null && (
                                  <>
                                    {' '}
                                    <span className={styles['history__filler']}>
                                      {t('profile.history.on')}
                                    </span>{' '}
                                    <ScoreBadge
                                      rating={rating}
                                      size="sm"
                                      className={styles['history__rating-badge']}
                                    />
                                  </>
                                )}
                              </p>
                            </div>
                            <span className={styles['history__time']}>
                              {new Date(event.date).toLocaleTimeString(
                                i18n.language === 'ru' ? 'ru-RU' : 'en-US',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </Collapse>
                </div>
              )
            })}
          </div>
        )
      ) : activeTab === 'friends' ? (
        <FriendsTab />
      ) : (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <BarChart3 size={48} />
          </div>
          <p className={styles['empty-state__text']}>{t('profile.stats.empty')}</p>
        </div>
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
