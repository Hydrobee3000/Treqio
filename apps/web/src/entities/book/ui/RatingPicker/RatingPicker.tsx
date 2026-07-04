import { useState } from 'react'
import { Popover, Rating, Slider } from '@mui/material'
import { scoreColor } from '../../model/book.types'
import styles from './RatingPicker.module.scss'

/** Пропсы RatingPicker. */
interface RatingPickerProps {
  /** Якорный элемент для позиционирования. */
  anchorEl: HTMLElement | null
  /** Видимость поп-овера. */
  open: boolean
  /** Текущая оценка (инициализирует черновик). */
  rating: number | null
  /** Закрытие поп-овера. */
  onClose: () => void
  /** Выбранная оценка. */
  onChange: (rating: number) => void
}

/**
 * Поп-овер выбора оценки книги: звёздный виджет и слайдер 1–10.
 */
export const RatingPicker = ({ anchorEl, open, rating, onClose, onChange }: RatingPickerProps) => {
  const [ratingDraft, setRatingDraft] = useState(rating ?? 5)

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <div className={styles['rating-picker']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['rating-picker__stars']}>
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
              onChange(next)
              onClose()
            }}
          />
        </div>
        <Slider
          value={ratingDraft}
          min={1}
          max={10}
          step={1}
          onChange={(_, value) => setRatingDraft(value as number)}
          onChangeCommitted={(_, value) => {
            onChange(value as number)
            onClose()
          }}
        />
        <p className={styles['rating-picker__value']}>
          {ratingDraft} <span className={styles['rating-picker__denom']}>/ 10</span>
        </p>
      </div>
    </Popover>
  )
}
