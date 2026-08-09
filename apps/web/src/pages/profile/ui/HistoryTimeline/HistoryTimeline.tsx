import { memo, useCallback, useState } from 'react'
import { ChevronDown, History } from 'lucide-react'
import { Collapse } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { BookTitleChip, ScoreBadge, StatusChip } from '@/entities/book'
import { EmptyState } from '@/shared/ui'
import type { HistoryDayGroup, HistoryEventType } from '../../model/historyEvents'
import {
  HISTORY_ICON,
  hasAccompanyingCreationEvent,
  hasSeparateRatingEvent,
} from '../../model/historyEvents'
import styles from './HistoryTimeline.module.scss'

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

/** Свойства одного дня в таймлайне. */
interface DayGroupProps {
  /** События одного дня. */
  group: HistoryDayGroup
  /** Свёрнут ли день. */
  collapsed: boolean
  /** Колбэк переключения свёрнутости — должен быть стабильной ссылкой. */
  onToggle: (label: string) => void
  /** Текущий язык интерфейса — для форматирования времени. */
  language: string
}

/**
 * Один день таймлайна.
 */
const DayGroup = memo(function DayGroup({ group, collapsed, onToggle, language }: DayGroupProps) {
  const { t } = useTranslation()

  return (
    <div className={styles['history__day']}>
      <div className={styles['history__date']} onClick={() => onToggle(group.label)}>
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
                    <BookTitleChip title={event.entry.book.title} />
                    {event.type === 'ADDED' && !hasAccompanyingCreationEvent(event.entry) && (
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
                  {new Date(event.date).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )
          })}
        </div>
      </Collapse>
    </div>
  )
})

/** Свойства HistoryTimeline. */
interface Props {
  /** События истории, сгруппированные по дням. */
  dayGroups: HistoryDayGroup[]
  /** Текущий язык интерфейса — для форматирования времени. */
  language: string
}

/**
 * Таймлайн истории — сгруппированные по дням события профиля.
 *
 * Состояние свёрнутых дней живёт внутри компонента, а не в родительской
 * странице — иначе каждый клик по дате перерендеривал бы всю страницу.
 */
export function HistoryTimeline({ dayGroups, language }: Props) {
  const { t } = useTranslation()
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set())

  /**
   * Функция переключения состояния блока событий за указанный день.
   * useCallback без зависимостей — стабильная ссылка нужна, чтобы memo
   * у DayGroup не ломался при каждом рендере HistoryTimeline.
   */
  const toggleDay = useCallback((label: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  if (dayGroups.length === 0) {
    return (
      <EmptyState
        fullHeight
        icon={<History size={48} />}
        title={t('profile.history.empty.title')}
        description={t('profile.history.empty.desc')}
      />
    )
  }

  return (
    <div className={styles['history']}>
      {dayGroups.map((group) => (
        <DayGroup
          key={group.label}
          group={group}
          collapsed={collapsedDays.has(group.label)}
          onToggle={toggleDay}
          language={language}
        />
      ))}
    </div>
  )
}
