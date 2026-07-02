import { forwardRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Box, Menu, MenuItem, Popover, Rating, Slider, Tooltip, Typography } from '@mui/material'
import { Check, Star } from 'lucide-react'
import { STATUS_DOT_COLOR, STATUS_LABEL, STATUS_OPTIONS, scoreColor } from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import styles from './BookCoverCard.module.scss'

/** Класс цветовой пилюли статуса на карточке. */
const STATUS_CLASS: Record<BookStatus, string | undefined> = {
  WANT: styles['cover-card__status--want'],
  READING: styles['cover-card__status--reading'],
  DONE: styles['cover-card__status--done'],
  DROPPED: styles['cover-card__status--dropped'],
}

/**
 * Круглый бейдж с оценкой (или плейсхолдер если книга не оценена).
 */
const ScoreBadge = forwardRef<
  HTMLDivElement,
  {
    rating: number | null
    onClick: (e: MouseEvent<HTMLElement>) => void
  }
>(function ScoreBadge({ rating, onClick }, ref) {
  if (rating === null) {
    return (
      <div ref={ref} className={styles['cover-card__score']} onClick={onClick}>
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
    <Tooltip title={`Оценка ${rating}/10`}>
      <div ref={ref} className={styles['cover-card__score']} onClick={onClick}>
        <svg className={styles['cover-card__score-ring']} viewBox="0 0 34 34">
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
          <Star size={14} fill="#fff" stroke="none" />
        ) : (
          <span className={styles['cover-card__score-value']}>{rating}</span>
        )}
      </div>
    </Tooltip>
  )
})

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
 * Карточка книги в стиле «обложка» — один из стилей отображения библиотеки.
 * Клик по статусу или оценке открывает быстрый выбор этого поля,
 * клик по остальной области карточки — открывает полное редактирование.
 */
export const BookCoverCard = ({
  entry,
  size = 'large',
  showStatus = true,
  onExpand,
  onStatusChange,
  onRatingChange,
}: BookCoverCardProps) => {
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
    setStatusOpen(true)
  }

  /** Открывает поп-овер выбора оценки, не давая клику дойти до редактирования всей карточки. */
  const handleRatingClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setRatingDraft(rating ?? 5)
    setRatingOpen(true)
  }

  return (
    <div className={`${styles['cover-card']} ${styles[`cover-card--${size}`] ?? ''}`}>
      <div className={styles['cover-card__cover-frame']}>
        <motion.div
          layoutId={`book-cover-${entry.id}`}
          data-card-id={entry.id}
          className={styles['cover-card__cover']}
          onClick={onExpand}
          transition={{ layout: { duration: 0 } }}
        >
          {status === 'DONE' && (
            <ScoreBadge ref={setScoreEl} rating={rating} onClick={handleRatingClick} />
          )}
          <div className={styles['cover-card__title']}>
            <span className={styles['cover-card__title-text']}>{book.title}</span>
          </div>
          <div className={styles['cover-card__author']}>{book.author}</div>
        </motion.div>
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
              {STATUS_LABEL[status]}
            </span>
          )}
          {progressPct !== null && (
            <div className={styles['cover-card__progress']}>
              <span
                className={styles['cover-card__progress-bar']}
                style={{ width: `${progressPct}%` }}
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
            sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange?.(option.value)
              setStatusOpen(false)
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
        anchorEl={scoreEl}
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
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
                setRatingOpen(false)
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
              setRatingOpen(false)
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
