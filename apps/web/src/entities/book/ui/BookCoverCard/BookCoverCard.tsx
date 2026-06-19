import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Box, Menu, MenuItem, Popover, Slider, Typography } from '@mui/material'
import { Check, Star } from 'lucide-react'
import type { BookEntry, BookStatus } from '../../model/book.types'
import styles from './BookCoverCard.module.scss'

const STATUS_LABEL: Record<BookStatus, string> = {
  WANT: 'Хочу прочитать',
  READING: 'Читаю',
  DONE: 'Прочитал',
  DROPPED: 'Брошено',
}

const STATUS_CLASS: Record<BookStatus, string | undefined> = {
  WANT: styles['cover-card__status--want'],
  READING: styles['cover-card__status--reading'],
  DONE: styles['cover-card__status--done'],
  DROPPED: styles['cover-card__status--dropped'],
}

/** Цвет точки статуса в поп-овере выбора — совпадает с цветом пилюли на карточке. */
const STATUS_DOT_COLOR: Record<BookStatus, string> = {
  WANT: '#999',
  READING: '#5aa0c8',
  DONE: 'var(--color-primary, #4e7b6a)',
  DROPPED: '#b94040',
}

/** Варианты статуса для быстрого выбора в поп-овере. */
const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({
  value: value as BookStatus,
  label,
}))

/** Цвет кольца и числа в бейдже оценки — по диапазону. */
function scoreColor(rating: number): string {
  // Цвета фиксированы (не из токенов темы) — это семантическая «светофорная»
  // шкала оценки, а не акцентный цвет, поэтому она не должна зависеть от темы.
  if (rating >= 8) return '#5e9b84'
  if (rating >= 6) return '#c49a3a'
  return '#b94040'
}

/** Путь звезды для рядов закрашиваемых звёзд оценки. */
const STAR_PATH = 'm12 3 2.6 5.6 6.1.6-4.6 4.2 1.3 6L12 16.5 6.6 19.4l1.3-6L3.3 9.2l6.1-.6z'

/**
 * Ряд из 5 звёзд, закрашенных пропорционально оценке по шкале 1–10
 * (10 — все 5 звёзд, 5 — 2.5 звезды и т.д.).
 */
function StarRow({ value, gradientPrefix }: { value: number; gradientPrefix: string }) {
  const fiveScale = value / 2
  const color = scoreColor(value)

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, fiveScale - (i - 1)))
        const gradientId = `${gradientPrefix}-${i}`
        return (
          <svg key={i} width={32} height={32} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={gradientId}>
                <stop offset={`${fill * 100}%`} stopColor={color} />
                <stop offset={`${fill * 100}%`} stopColor="rgba(150,150,150,0.3)" />
              </linearGradient>
            </defs>
            <path d={STAR_PATH} fill={`url(#${gradientId})`} />
          </svg>
        )
      })}
    </Box>
  )
}

/**
 * Круглый бейдж с оценкой (или плейсхолдер если книга не оценена).
 */
function ScoreBadge({
  rating,
  onClick,
}: {
  rating: number | null
  onClick: (e: MouseEvent<HTMLElement>) => void
}) {
  if (rating === null) {
    return (
      <div className={styles['cover-card__score']} onClick={onClick}>
        <span
          className={`${styles['cover-card__score-value']} ${styles['cover-card__score-value--empty']}`}
        >
          +
        </span>
      </div>
    )
  }

  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - rating / 10)
  const color = scoreColor(rating)

  return (
    <div className={styles['cover-card__score']} onClick={onClick} title={`Оценка ${rating}/10`}>
      <svg className={styles['cover-card__score-ring']} width="34" height="34" viewBox="0 0 34 34">
        <circle
          cx="17"
          cy="17"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="3"
        />
        <circle
          cx="17"
          cy="17"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {rating === 10 ? (
        <Star size={14} fill={color} stroke="none" />
      ) : (
        <span className={styles['cover-card__score-value']}>{rating}</span>
      )}
    </div>
  )
}

/**
 * Пропсы BookCoverCard.
 */
interface BookCoverCardProps {
  /** Запись пользователя с данными книги. */
  entry: BookEntry
  /** Клик по карточке вне статуса и рейтинга — открывает редактирование всех полей. */
  onEdit?: () => void
  /** Выбор статуса в быстром поп-овере. */
  onStatusChange?: (status: BookStatus) => void
  /** Выбор оценки в быстром поп-овере. */
  onRatingChange?: (rating: number) => void
}

/**
 * Карточка книги в стиле «обложка» — альтернативный вид BookCard.
 * Клик по статусу или оценке открывает быстрый выбор этого поля,
 * клик по остальной области карточки — открывает полное редактирование.
 */
export const BookCoverCard = ({
  entry,
  onEdit,
  onStatusChange,
  onRatingChange,
}: BookCoverCardProps) => {
  const { book, status, rating, progress } = entry
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null)
  const [ratingAnchor, setRatingAnchor] = useState<HTMLElement | null>(null)
  // Черновое значение слайдера — обновляется при перетаскивании,
  // а мутация отправляется только когда пользователь отпускает слайдер.
  const [ratingDraft, setRatingDraft] = useState(rating ?? 5)

  const progressPct =
    status === 'READING' && progress !== null && book.pageCount
      ? Math.min(100, Math.round((progress / book.pageCount) * 100))
      : null

  /** Открывает поп-овер выбора статуса, не давая клику дойти до редактирования всей карточки. */
  const handleStatusClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setStatusAnchor(e.currentTarget)
  }

  /** Открывает поп-овер выбора оценки, не давая клику дойти до редактирования всей карточки. */
  const handleRatingClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setRatingDraft(rating ?? 5)
    setRatingAnchor(e.currentTarget)
  }

  return (
    <div className={styles['cover-card']} onClick={onEdit}>
      <div className={styles['cover-card__cover']}>
        {rating === 10 && <div className={styles['cover-card__gold-ring']} />}
        <ScoreBadge rating={rating} onClick={handleRatingClick} />
        <div className={styles['cover-card__title']}>{book.title}</div>
        <div className={styles['cover-card__author']}>{book.author}</div>
      </div>

      <div className={styles['cover-card__footer']}>
        <p className={styles['cover-card__footer-title']}>{book.title}</p>
        <span
          className={`${styles['cover-card__status']} ${STATUS_CLASS[status]}`}
          onClick={handleStatusClick}
        >
          <span className={styles['cover-card__status-dot']} />
          {STATUS_LABEL[status]}
        </span>
        {progressPct !== null && (
          <div className={styles['cover-card__progress']}>
            <span
              className={styles['cover-card__progress-bar']}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      <Menu
        anchorEl={statusAnchor}
        open={!!statusAnchor}
        onClose={() => setStatusAnchor(null)}
        slotProps={{ list: { dense: true } }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === status}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange?.(option.value)
              setStatusAnchor(null)
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: STATUS_DOT_COLOR[option.value],
              }}
            />
            <Box sx={{ flex: 1, fontSize: 13 }}>{option.label}</Box>
            {option.value === status && <Check size={14} />}
          </MenuItem>
        ))}
      </Menu>

      <Popover
        anchorEl={ratingAnchor}
        open={!!ratingAnchor}
        onClose={() => setRatingAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box sx={{ width: 200, pt: 2, px: 2, pb: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{ mb: 1 }}>
            <StarRow value={ratingDraft} gradientPrefix={`rate-${entry.id}`} />
          </Box>
          <Typography align="center" sx={{ fontWeight: 600, mb: 0.5 }}>
            {ratingDraft}{' '}
            <Typography component="span" variant="caption" color="text.secondary">
              / 10
            </Typography>
          </Typography>
          <Slider
            value={ratingDraft}
            min={1}
            max={10}
            step={1}
            onChange={(_, value) => setRatingDraft(value as number)}
            onChangeCommitted={(_, value) => {
              onRatingChange?.(value as number)
              setRatingAnchor(null)
            }}
          />
        </Box>
      </Popover>
    </div>
  )
}
