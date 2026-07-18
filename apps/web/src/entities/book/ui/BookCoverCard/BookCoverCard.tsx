import { useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { Menu, MenuItem } from '@mui/material'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { STATUS_DOT_COLOR, STATUS_OPTIONS } from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import { RatingPicker } from '../RatingPicker/RatingPicker'
import { ScoreBadge } from '../ScoreBadge/ScoreBadge'
import styles from './BookCoverCard.module.scss'

/** Класс цветовой пилюли статуса на карточке. */
const STATUS_CLASS: Record<BookStatus, string | undefined> = {
  WANT: styles['cover-card__status--want'],
  READING: styles['cover-card__status--reading'],
  DONE: styles['cover-card__status--done'],
  DROPPED: styles['cover-card__status--dropped'],
}

/** Размер карточки — масштабирует шрифты и бейдж оценки внутри обложки. */
type CardSize = 'compact' | 'medium' | 'large'

/**
 * Пропсы BookCoverCard.
 */
interface BookCoverCardProps {
  /** Запись пользователя с данными книги. */
  entry: BookEntry
  /** Размер карточки. По умолчанию «large» — исходный размер обложки. */
  size?: CardSize
  /** Флаг отображения пилюли статуса под обложкой. По умолчанию true. */
  showStatus?: boolean
  /** Клик по обложке — открывает просмотр/редактирование карточки. */
  onExpand?: () => void
  /** Выбор статуса в быстром поп-овере. */
  onStatusChange?: (status: BookStatus) => void
  /** Выбор оценки в быстром поп-овере. */
  onRatingChange?: (rating: number) => void
}

/**
 * Карточка книги в стиле «обложка».
 */
export const BookCoverCard = ({
  entry,
  size = 'large',
  showStatus = true,
  onExpand,
  onStatusChange,
  onRatingChange,
}: BookCoverCardProps) => {
  const { t } = useTranslation()
  const { book, status, rating, progress } = entry
  // anchorEl держим в state, обновляемом через callback ref, а не как
  // ссылку, замороженную в момент клика: если фоновая перезагрузка списка
  // (после мутации статуса/оценки) пересоздаст DOM-узел карточки, пока
  // поп-овер ещё открыт, React сам вызовет callback ref на новом узле —
  // и anchorEl останется верным. Замороженная на клике ссылка вместо этого
  // указывала бы в никуда, и MUI Popover схлопывал позицию в (0,0).
  const [statusEl, setStatusEl] = useState<HTMLSpanElement | null>(null)
  const [scoreEl, setScoreEl] = useState<HTMLDivElement | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)

  const progressPct =
    status === 'READING' && progress !== null && book.pageCount
      ? Math.min(100, Math.round((progress / book.pageCount) * 100))
      : null

  /** Открывает поп-овер выбора статуса, не давая клику дойти до редактирования всей карточки. */
  const handleStatusClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setStatusOpen(true)
  }

  /** Открывает поп-овер выбора оценки, не давая клику дойти до редактирования всей карточки. */
  const handleRatingClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setRatingOpen(true)
  }

  return (
    <div className={`${styles['cover-card']} ${styles[`cover-card--${size}`] ?? ''}`}>
      <div className={styles['cover-card__cover-frame']}>
        <div data-card-id={entry.id} className={styles['cover-card__cover']} onClick={onExpand}>
          {status === 'DONE' && (
            <ScoreBadge
              ref={setScoreEl}
              rating={rating}
              size="sm"
              className={styles['cover-card__score']}
              onClick={handleRatingClick}
            />
          )}
          <div className={styles['cover-card__title']}>
            <span className={styles['cover-card__title-text']}>{book.title}</span>
          </div>
          <div className={styles['cover-card__author']}>{book.author || '—'}</div>
        </div>
        {status === 'DONE' && rating === 10 && <div className={styles['cover-card__gold-ring']} />}
      </div>

      {(showStatus || progressPct !== null) && (
        <div className={styles['cover-card__footer']}>
          {showStatus && (
            <span
              ref={setStatusEl}
              className={`${styles['cover-card__status']} ${STATUS_CLASS[status]}`}
              onClick={handleStatusClick}
            >
              <span className={styles['cover-card__status-dot']} />
              {t(`book.status.${status}`)}
            </span>
          )}
          {progressPct !== null && (
            <div className={styles['cover-card__progress']}>
              <span
                className={styles['cover-card__progress-bar']}
                style={{ '--progress-pct': `${progressPct}%` } as CSSProperties}
              />
            </div>
          )}
        </div>
      )}

      <Menu
        anchorEl={statusEl}
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        slotProps={{ list: { dense: true } }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === status}
            className={styles['cover-card__menu-item']}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange?.(option.value)
              setStatusOpen(false)
            }}
          >
            <span
              className={styles['cover-card__menu-dot']}
              style={{ background: STATUS_DOT_COLOR[option.value] }}
            />
            <span className={styles['cover-card__menu-label']}>
              {t(`book.status.${option.value}`)}
            </span>
            {option.value === status && <Check size={14} />}
          </MenuItem>
        ))}
      </Menu>

      <RatingPicker
        anchorEl={scoreEl}
        open={ratingOpen}
        rating={rating}
        onClose={() => setRatingOpen(false)}
        onChange={(r) => onRatingChange?.(r)}
      />
    </div>
  )
}
