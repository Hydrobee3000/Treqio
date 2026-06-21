import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Box, Menu, MenuItem, Popover, Rating, Slider, Typography } from '@mui/material'
import { Check, Star } from 'lucide-react'
import { STATUS_LABEL } from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import styles from './BookCoverCard.module.scss'

const STATUS_CLASS: Record<BookStatus, string | undefined> = {
  WANT: styles['cover-card__status--want'],
  READING: styles['cover-card__status--reading'],
  DONE: styles['cover-card__status--done'],
  DROPPED: styles['cover-card__status--dropped'],
}

/** Цвет статуса «Прочитано» — фиксированный зелёный, не зависит от акцентного цвета темы. */
const STATUS_DONE_COLOR = '#4caf6e'

/** Цвет точки статуса в поп-овере выбора — совпадает с цветом пилюли на карточке. */
const STATUS_DOT_COLOR: Record<BookStatus, string> = {
  WANT: '#9c8a6a',
  READING: '#5aa0c8',
  DONE: STATUS_DONE_COLOR,
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

/** Цвет звезды идеальной оценки 10/10 — золотой, чтобы не слиться с зелёной шкалой оценок. */
const GOLD_COLOR = '#ffd24a'

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
        <Star size={14} fill={GOLD_COLOR} stroke="none" />
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
 * Карточка книги в стиле «обложка» — один из стилей отображения библиотеки.
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
    <div className={styles['cover-card']}>
      <div className={styles['cover-card__cover-frame']}>
        <div className={styles['cover-card__cover']} onClick={onEdit}>
          <ScoreBadge rating={rating} onClick={handleRatingClick} />
          <div className={styles['cover-card__title']}>{book.title}</div>
          <div className={styles['cover-card__author']}>{book.author}</div>
        </div>
        {rating === 10 && <div className={styles['cover-card__gold-ring']} />}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Rating
              value={ratingDraft / 2}
              precision={0.5}
              max={5}
              sx={{
                fontSize: 30,
                '& .MuiRating-iconFilled': { color: scoreColor(ratingDraft) },
                '& .MuiRating-iconHover': { color: scoreColor(ratingDraft) },
              }}
              onChange={(_, value) => {
                const next = Math.max(1, Math.round((value ?? 0) * 2))
                setRatingDraft(next)
                onRatingChange?.(next)
                setRatingAnchor(null)
              }}
            />
          </Box>
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
          <Typography align="center" sx={{ fontWeight: 600, mb: 0.5 }}>
            {ratingDraft}{' '}
            <Typography component="span" variant="caption" color="text.secondary">
              / 10
            </Typography>
          </Typography>
        </Box>
      </Popover>
    </div>
  )
}
