import { ChevronDown, History } from 'lucide-react'
import { Collapse } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { BookTitleChip, STATUS_TEXT_COLOR, ScoreBadge } from '@/entities/book'
import type { BookStatus } from '@/entities/book'
import { EmptyState } from '@/shared/ui'
import type { HistoryDayGroup, HistoryEventType } from '../../model/historyEvents'
import {
  HISTORY_ICON,
  hasAccompanyingCreationEvent,
  hasSeparateRatingEvent,
} from '../../model/historyEvents'
import styles from './HistoryTimeline.module.scss'

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

/** Свойства HistoryTimeline. */
interface Props {
  /** События истории, сгруппированные по дням. */
  dayGroups: HistoryDayGroup[]
  /** Свёрнутые дни. */
  collapsedDays: Set<string>
  /** Колбэк переключения свёрнутости дня. */
  onToggleDay: (label: string) => void
  /** Текущий язык интерфейса — для форматирования времени. */
  language: string
}

/**
 * Таймлайн истории — сгруппированные по дням события профиля.
 */
export function HistoryTimeline({ dayGroups, collapsedDays, onToggleDay, language }: Props) {
  const { t } = useTranslation()

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
      {dayGroups.map((group) => {
        const collapsed = collapsedDays.has(group.label)
        return (
          <div key={group.label} className={styles['history__day']}>
            <div className={styles['history__date']} onClick={() => onToggleDay(group.label)}>
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
                        {new Date(event.date).toLocaleTimeString(
                          language === 'ru' ? 'ru-RU' : 'en-US',
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
}
