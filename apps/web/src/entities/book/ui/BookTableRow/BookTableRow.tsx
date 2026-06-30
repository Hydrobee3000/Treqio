import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Box, Menu, MenuItem, Popover, Rating, Slider, Typography } from '@mui/material'
import { Check, Star } from 'lucide-react'
import { STATUS_LABEL } from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import styles from './BookTableRow.module.scss'

const STATUS_CLASS: Record<BookStatus, string | undefined> = {
  WANT: styles['table-row__status--want'],
  READING: styles['table-row__status--reading'],
  DONE: styles['table-row__status--done'],
  DROPPED: styles['table-row__status--dropped'],
}

/** Цвет статуса «Прочитано» — фиксированный зелёный, не зависит от акцентного цвета темы. */
const STATUS_DONE_COLOR = '#4caf6e'

/** Цвет точки статуса в поп-овере выбора — совпадает с цветом пилюли в строке. */
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

/** Цвет звёзд и числа оценки — по диапазону, фиксирован, не зависит от темы. */
function scoreColor(rating: number): string {
  if (rating >= 8) return '#5e9b84'
  if (rating >= 6) return '#c49a3a'
  return '#b94040'
}

/** Цвет звезды идеальной оценки 10/10 — золотой, чтобы не слиться с зелёной шкалой оценок. */
const GOLD_COLOR = '#ffd24a'

/**
 * Свойства BookTableRow.
 */
interface BookTableRowProps {
  /** Запись пользователя с данными книги. */
  entry: BookEntry
  /** Клик по строке вне статуса и оценки — открывает редактирование всех полей. */
  onEdit?: () => void
  /** Выбор статуса в быстром поп-овере. */
  onStatusChange?: (status: BookStatus) => void
  /** Выбор оценки в быстром поп-овере. */
  onRatingChange?: (rating: number) => void
}

/**
 * Строка книги в табличном виде — один из стилей отображения библиотеки.
 * Клик по статусу или оценке открывает быстрый выбор этого поля,
 * клик по остальной области строки — открывает полное редактирование.
 */
export const BookTableRow = ({
  entry,
  onEdit,
  onStatusChange,
  onRatingChange,
}: BookTableRowProps) => {
  const { book, status, rating } = entry
  // anchorEl держим в state, обновляемом через callback ref, а не как
  // ссылку, замороженную в момент клика: если фоновая перезагрузка списка
  // (после мутации статуса/оценки) пересоздаст DOM-узел строки, пока
  // поп-овер ещё открыт, React сам вызовет callback ref на новом узле —
  // и anchorEl останется верным. Замороженная на клике ссылка вместо этого
  // указывала бы в никуда, и MUI Popover схлопывал позицию в (0,0).
  const [statusEl, setStatusEl] = useState<HTMLSpanElement | null>(null)
  const [ratingEl, setRatingEl] = useState<HTMLDivElement | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)
  // Черновое значение слайдера — обновляется при перетаскивании,
  // а мутация отправляется только когда пользователь отпускает слайдер.
  const [ratingDraft, setRatingDraft] = useState(rating ?? 5)

  /** Открывает поп-овер выбора статуса, не давая клику дойти до редактирования строки. */
  const handleStatusClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setStatusOpen(true)
  }

  /** Открывает поп-овер выбора оценки, не давая клику дойти до редактирования строки. */
  const handleRatingClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    setRatingDraft(rating ?? 5)
    setRatingOpen(true)
  }

  return (
    <div className={styles['table-row']}>
      <div className={styles['table-row__cover-wrap']} onClick={onEdit}>
        <div className={styles['table-row__cover']} />
        {status === 'DONE' && rating === 10 && <div className={styles['table-row__gold-ring']} />}
      </div>

      <div className={styles['table-row__info']} onClick={onEdit}>
        <div className={styles['table-row__title']}>{book.title}</div>
        <div className={styles['table-row__author']}>{book.author}</div>
      </div>

      <span
        ref={setStatusEl}
        className={`${styles['table-row__status']} ${STATUS_CLASS[status]}`}
        onClick={handleStatusClick}
      >
        <span className={styles['table-row__status-dot']} />
        {STATUS_LABEL[status]}
      </span>

      <div
        ref={setRatingEl}
        className={`${styles['table-row__rating']} ${status !== 'DONE' ? styles['table-row__rating--disabled'] : ''}`}
        onClick={status === 'DONE' ? handleRatingClick : undefined}
      >
        {status === 'DONE' && rating !== null ? (
          <>
            <Rating
              readOnly
              value={rating / 2}
              precision={0.5}
              max={5}
              size="small"
              sx={{
                '& .MuiRating-iconFilled': { color: scoreColor(rating) },
              }}
            />
            <span
              className={styles['table-row__rating-value']}
              style={{ color: scoreColor(rating) }}
            >
              {rating === 10 ? <Star size={13} fill={GOLD_COLOR} stroke="none" /> : rating}
            </span>
          </>
        ) : (
          <span className={styles['table-row__rating-empty']}>—</span>
        )}
      </div>

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
        anchorEl={ratingEl}
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
