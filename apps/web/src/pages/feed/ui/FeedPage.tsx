import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { CircularProgress, Collapse } from '@mui/material'
import { ChevronDown, Plus, RefreshCw, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { BookTitleChip, ScoreBadge, StatusChip } from '@/entities/book'
import { Avatar } from '@/entities/user'
import type {
  ActivityType,
  EntryAddedPayload,
  FeedItem,
  RatedPayload,
  StatusChangedPayload,
} from '@/features/activity'
import { useLazyGetFeedQuery } from '@/features/activity'
import { ActivityEmptyState } from '@/shared/ui'
import type { FeedDayGroup } from '../model/feedGrouping'
import { groupFeedByDay } from '../model/feedGrouping'
import styles from './FeedPage.module.scss'

/** Иконка узла на ленте для каждого типа события. */
const FEED_ICON: Record<ActivityType, ComponentType<{ size?: number }>> = {
  ENTRY_ADDED: Plus,
  STATUS_CHANGED: RefreshCw,
  RATED: Star,
}

/** Тело события — акцентная фраза, книга и при необходимости статус/оценка. */
function FeedEventBody({ item }: { item: FeedItem }) {
  const { t } = useTranslation()
  const chip = <BookTitleChip title={item.bookEntry.book.title} />

  if (item.type === 'ENTRY_ADDED') {
    const payload = item.payload as EntryAddedPayload
    return (
      <p className={styles['feed__text']}>
        <span className={styles['feed__verb--added']}>{t('feed.verbs.added')}</span>{' '}
        <span className={styles['feed__filler']}>{t('feed.verbs.addedSuffix')}</span> {chip}{' '}
        <span className={styles['feed__filler']}>{t('feed.verbs.withStatus')}</span>{' '}
        <StatusChip status={payload.status} />
      </p>
    )
  }

  if (item.type === 'STATUS_CHANGED') {
    const payload = item.payload as StatusChangedPayload
    return (
      <p className={styles['feed__text']}>
        <span className={styles['feed__verb--status']}>{t('feed.verbs.statusChanged')}</span> {chip}{' '}
        <span className={styles['feed__filler']}>{t('feed.verbs.to')}</span>{' '}
        <StatusChip status={payload.to} />
      </p>
    )
  }

  const payload = item.payload as RatedPayload
  if (payload.rating === null) {
    return (
      <p className={styles['feed__text']}>
        <span className={styles['feed__verb--rated']}>{t('feed.verbs.unrated')}</span> {chip}
      </p>
    )
  }
  return (
    <p className={styles['feed__text']}>
      <span className={styles['feed__verb--rated']}>{t('feed.verbs.rated')}</span> {chip}{' '}
      <span className={styles['feed__filler']}>{t('feed.verbs.to')}</span>{' '}
      <ScoreBadge rating={payload.rating} size="sm" className={styles['feed__rating-badge']} />
    </p>
  )
}

/** Свойства одного дня ленты. */
interface FeedDayProps {
  /** События одного дня. */
  group: FeedDayGroup
  /** Свёрнут ли день. */
  collapsed: boolean
  /** Колбэк переключения свёрнутости — должен быть стабильной ссылкой. */
  onToggle: (label: string) => void
  /** Текущий язык интерфейса — для форматирования времени. */
  language: string
}

/**
 * Один день ленты — вынесен и мемоизирован отдельно, чтобы сворачивание
 * одного дня не перерендеривало остальные (актуально при большом их числе).
 */
const FeedDay = memo(function FeedDay({ group, collapsed, onToggle, language }: FeedDayProps) {
  return (
    <div className={styles['feed__day']}>
      <div className={styles['feed__date']} onClick={() => onToggle(group.label)}>
        {group.label}
        <ChevronDown
          size={14}
          className={`${styles['feed__date-chevron']} ${collapsed ? styles['feed__date-chevron--collapsed'] : ''}`}
        />
      </div>
      <Collapse in={!collapsed}>
        <div className={styles['feed__timeline']}>
          {group.items.map((item) => {
            const Icon = FEED_ICON[item.type]
            return (
              <div key={item.id} className={styles['feed__event']}>
                <div
                  className={`${styles['feed__node']} ${styles[`feed__node--${item.type.toLowerCase()}`]}`}
                >
                  <Icon size={14} />
                </div>
                <div className={styles['feed__header']}>
                  {item.user.username ? (
                    <Link to={`/${item.user.username}`} className={styles['feed__avatar-link']}>
                      <Avatar
                        displayName={item.user.displayName ?? item.user.username ?? '?'}
                        size={32}
                        className={styles['feed__avatar']}
                      />
                    </Link>
                  ) : (
                    <Avatar
                      displayName={item.user.displayName ?? item.user.username ?? '?'}
                      size={32}
                      className={styles['feed__avatar']}
                    />
                  )}
                  <div className={styles['feed__author-block']}>
                    {item.user.username ? (
                      <Link to={`/${item.user.username}`} className={styles['feed__author']}>
                        {item.user.displayName ?? item.user.username}
                      </Link>
                    ) : (
                      <span className={styles['feed__author']}>{item.user.displayName}</span>
                    )}
                    {item.user.username && (
                      <span className={styles['feed__username']}>@{item.user.username}</span>
                    )}
                  </div>
                  <span className={styles['feed__time']}>
                    {new Date(item.createdAt).toLocaleTimeString(
                      language === 'ru' ? 'ru-RU' : 'en-US',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
                <FeedEventBody item={item} />
              </div>
            )
          })}
        </div>
      </Collapse>
    </div>
  )
})

/**
 * Страница ленты активности друзей.
 */
export function FeedPage() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState<FeedItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set())
  const [trigger, { isFetching }] = useLazyGetFeedQuery()

  /**
   * Функция переключения состояния блока событий за указанный день.
   * useCallback без зависимостей — стабильная ссылка нужна, чтобы memo
   * у FeedDay не ломался при каждом рендере FeedPage.
   */
  const toggleDay = useCallback((label: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const dayGroups = useMemo(
    () => groupFeedByDay(items, i18n.language, t('feed.today'), t('feed.yesterday')),
    [items, i18n.language, t],
  )

  useEffect(() => {
    void trigger(undefined)
      .unwrap()
      .then((page) => {
        setItems(page.items)
        setCursor(page.nextCursor)
      })
      .finally(() => setIsInitialLoading(false))
    // Загружаем один раз при заходе на страницу.
  }, [trigger])

  const handleLoadMore = () => {
    if (!cursor) return
    void trigger(cursor)
      .unwrap()
      .then((page) => {
        setItems((prev) => [...prev, ...page.items])
        setCursor(page.nextCursor)
      })
  }

  if (isInitialLoading) {
    return (
      <div className={styles['feed__loading']}>
        <CircularProgress />
      </div>
    )
  }

  if (items.length === 0) {
    return <ActivityEmptyState title={t('feed.empty.title')} description={t('feed.empty.desc')} />
  }

  return (
    <div className={styles['feed']}>
      <h1 className={styles['feed__title']}>{t('feed.title')}</h1>

      {dayGroups.map((group) => (
        <FeedDay
          key={group.label}
          group={group}
          collapsed={collapsedDays.has(group.label)}
          onToggle={toggleDay}
          language={i18n.language}
        />
      ))}

      {cursor && (
        <button
          className={styles['feed__load-more']}
          onClick={handleLoadMore}
          disabled={isFetching}
        >
          {isFetching ? t('feed.loading') : t('feed.loadMore')}
        </button>
      )}
    </div>
  )
}
