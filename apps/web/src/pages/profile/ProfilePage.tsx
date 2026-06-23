import { useState, useRef, useEffect } from 'react'
import {
  ArrowRight,
  BarChart3,
  Check,
  History,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  X,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router'
import { STATUS_LABEL } from '@/entities/book'
import type { BookEntry, BookStatus } from '@/entities/book'
import { useGetMeQuery, useUpdateMeMutation, useLogoutMutation } from '@/features/user'
import { DISPLAY_NAME_MAX } from '@/features/user/api/constraints'
import { setGuestDisplayName } from '@/features/guest'
import { logout } from '@/features/auth'
import { useGetMyEntriesQuery } from '@/features/book'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import styles from './ProfilePage.module.scss'

const DEFAULT_DISPLAY_NAME = 'Мечтатель'

/** Вкладка страницы профиля. */
type ProfileTab = 'history' | 'stats'

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

/** Части фразы-действия — акцентное слово (цвет события) и нейтральные слова-связки (серые). */
interface HistoryVerbParts {
  /** Серая часть перед акцентным словом. */
  prefix?: string
  /** Акцентное слово/словосочетание — выделяется цветом события. */
  highlight: string
  /** Серая часть после акцентного слова. */
  suffix?: string
}

/** Глагол действия для текста события, разбитый на акцент и связки. */
const HISTORY_VERB: Record<HistoryEventType, HistoryVerbParts> = {
  ADDED: { highlight: 'добавил', suffix: 'новую книгу' },
  READING: { prefix: 'начал', highlight: 'читать', suffix: 'книгу' },
  DONE: { highlight: 'прочитал', suffix: 'книгу' },
  DROPPED: { highlight: 'забросил', suffix: 'книгу' },
  RATED: { highlight: 'изменил оценку', suffix: 'книги' },
  STATUS: { highlight: 'изменил статус', suffix: 'книги' },
}

/** Фраза-действие события — акцентное слово цветом события, связки серым. */
function VerbPhrase({ type }: { type: HistoryEventType }) {
  const { prefix, highlight, suffix } = HISTORY_VERB[type]
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

/** Иконка узла на таймлайне для каждого типа события. */
const HISTORY_ICON: Record<HistoryEventType, ComponentType<{ size?: number }>> = {
  ADDED: Plus,
  READING: ArrowRight,
  DONE: Check,
  DROPPED: X,
  RATED: Star,
  STATUS: RefreshCw,
}

/** Цвет текста статуса — совпадает с цветом пилюли статуса в библиотеке. */
const STATUS_TEXT_COLOR: Record<BookStatus, string> = {
  WANT: '#9c8a6a',
  READING: '#4a92bd',
  DONE: '#3d8a5c',
  DROPPED: '#b94040',
}

/** Цвет оценки — по диапазону, фиксирован, не зависит от темы (как в библиотеке). */
function scoreColor(rating: number): string {
  if (rating >= 8) return '#5e9b84'
  if (rating >= 6) return '#c49a3a'
  return '#b94040'
}

/** Цвет звезды идеальной оценки 10/10 — золотой, как в библиотеке. */
const GOLD_COLOR = '#ffd24a'

/** Кольцо оценки в событии активности — только просмотр, без возможности изменить. */
function RatingRing({ rating }: { rating: number }) {
  const color = rating === 10 ? GOLD_COLOR : scoreColor(rating)
  const pct = rating * 10
  return (
    <div
      className={styles['history__rating-ring']}
      style={{ background: `conic-gradient(${color} ${pct}%, var(--color-divider, #e0e0e0) 0)` }}
    >
      <span className={styles['history__rating-number']} style={{ color }}>
        {rating}
      </span>
    </div>
  )
}

/** Пилюля статуса в тексте события — цветной тинт фона, как у статуса на обложке в библиотеке. */
function StatusChip({ status }: { status: BookStatus }) {
  const color = STATUS_TEXT_COLOR[status]
  return (
    <span
      className={styles['history__status-chip']}
      style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      {STATUS_LABEL[status]}
    </span>
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

/** Лейбл дня события — «Сегодня», «Вчера» или дата в формате «12 июня». */
function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

/** Группирует отсортированные по дате события по дням. */
function groupEventsByDay(events: HistoryEvent[]): HistoryDayGroup[] {
  const groups: HistoryDayGroup[] = []
  for (const event of events) {
    const label = formatDayLabel(event.date)
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
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const guestDisplayName = useAppSelector((s) => s.guest.displayName)
  const { data: user, isLoading } = useGetMeQuery(undefined, { skip: isGuest })
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [logoutMutation] = useLogoutMutation()
  const { data: entries } = useGetMyEntriesQuery()

  /**
   * Функция выхода из аккаунта.
   */
  const handleLogout = async () => {
    await logoutMutation()
    dispatch(logout())
    navigate('/login')
  }
  const [activeTab, setActiveTab] = useState<ProfileTab>('history')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  /**
   * Фокусировка поля ввода при открытии редактора имени.
   */
  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  if (isLoading) return null

  /**
   * Функция редактирования имени пользователя.
   */
  const handleEditName = () => {
    const current = isGuest
      ? guestDisplayName || DEFAULT_DISPLAY_NAME
      : user?.displayName || user?.username || ''
    setNameValue(current)
    setEditingName(true)
  }

  /**
   * Функция сохранения имени пользователя.
   */
  const handleSaveName = async () => {
    const trimmed = nameValue.trim()
    const current = isGuest
      ? guestDisplayName || DEFAULT_DISPLAY_NAME
      : user?.displayName || user?.username || ''
    // Если пустое значение или имя не изменилось
    if (!trimmed || trimmed === current) {
      setEditingName(false)
      return
    }
    // Если гость - сохраняем локально без запроса к API
    if (isGuest) {
      dispatch(setGuestDisplayName(trimmed))
      setEditingName(false)
      return
    }
    try {
      await updateMe({ displayName: trimmed }).unwrap()
      setEditingName(false)
    } catch {
      setEditingName(false)
    }
  }

  /**
   * Функция отмены редактирования имени.
   */
  const handleCancelName = () => {
    setEditingName(false)
  }

  const displayName = isGuest
    ? guestDisplayName || DEFAULT_DISPLAY_NAME
    : user?.displayName || user?.username || DEFAULT_DISPLAY_NAME
  const avatarLetter = displayName.charAt(0).toUpperCase()
  const dayGroups = groupEventsByDay(buildHistoryEvents(entries ?? []))

  return (
    <div className={styles['profile']}>
      <div className={styles['header']}>
        {/* Аватар + инфо */}
        <div className={styles['header__top']}>
          <div className={styles['avatar-placeholder']}>{avatarLetter}</div>
          <div className={styles['header__info']}>
            <div
              className={`${styles['name-field']} ${editingName ? styles['name-field--editing'] : ''}`}
            >
              {editingName ? (
                <>
                  <input
                    ref={nameInputRef}
                    className={styles['name-field__input']}
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    maxLength={DISPLAY_NAME_MAX}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') handleCancelName()
                    }}
                  />
                  <div className={styles['name-field__actions']}>
                    <button className={styles['name-field__btn']} onClick={handleCancelName}>
                      <X size={15} />
                    </button>
                    <button
                      className={styles['name-field__btn']}
                      onClick={handleSaveName}
                      disabled={isSaving}
                    >
                      <Check size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className={styles['header__name']}>{displayName}</h1>
                  <button className={styles['name-field__btn']} onClick={handleEditName}>
                    <Pencil size={14} />
                  </button>
                </>
              )}
              {editingName && nameValue.length >= DISPLAY_NAME_MAX - 5 && (
                <p
                  className={[
                    styles['name-counter'],
                    nameValue.length >= DISPLAY_NAME_MAX
                      ? styles['name-counter--max']
                      : styles['name-counter--warn'],
                  ].join(' ')}
                >
                  {nameValue.length}/{DISPLAY_NAME_MAX}
                </p>
              )}
            </div>
            <div className={styles['header__meta']}>
              {user?.username && <span>@{user.username}</span>}
            </div>
            {user?.bio && <p className={styles['header__bio']}>{user.bio}</p>}
          </div>
          <button
            className={styles['header__auth-btn']}
            onClick={isGuest ? () => navigate('/login') : handleLogout}
            title={isGuest ? 'Войти' : 'Выйти'}
          >
            {isGuest ? <LogIn size={15} /> : <LogOut size={15} />}
            <span className={styles['header__auth-btn-label']}>{isGuest ? 'Войти' : 'Выйти'}</span>
          </button>
        </div>
      </div>

      <div className={styles['tabs']}>
        <button
          className={`${styles['tab']} ${activeTab === 'history' ? styles['tab--active'] : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={17} />
          Активность
        </button>
        <button
          className={`${styles['tab']} ${activeTab === 'stats' ? styles['tab--active'] : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={17} />
          Статистика
        </button>
      </div>

      {activeTab === 'history' ? (
        dayGroups.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-state__icon']}>
              <History size={48} />
            </div>
            <p className={styles['empty-state__text']}>Активность пока пуста</p>
            <p className={styles['empty-state__sub']}>
              Добавляй книги и отмечай прогресс — здесь появятся события
            </p>
          </div>
        ) : (
          <div className={styles['history']}>
            {dayGroups.map((group) => (
              <div key={group.label} className={styles['history__day']}>
                <div className={styles['history__date']}>{group.label}</div>
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
                                    со статусом
                                  </span>{' '}
                                  <StatusChip status={event.entry.status} />
                                </>
                              )}
                            {event.type === 'STATUS' && (
                              <>
                                {' '}
                                <span className={styles['history__filler']}>на</span>{' '}
                                <StatusChip status={event.entry.status} />
                              </>
                            )}
                            {showsRating && rating !== null && (
                              <>
                                {' '}
                                <span className={styles['history__filler']}>на</span>{' '}
                                <RatingRing rating={rating} />
                              </>
                            )}
                          </p>
                        </div>
                        <span className={styles['history__time']}>
                          {new Date(event.date).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <BarChart3 size={48} />
          </div>
          <p className={styles['empty-state__text']}>Статистика появится здесь позже</p>
        </div>
      )}
    </div>
  )
}
