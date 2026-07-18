import type { MouseEvent, Ref } from 'react'
import { Tooltip } from '@mui/material'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GOLD_COLOR, scoreColor } from '../../model/book.types'
import styles from './ScoreBadge.module.scss'

/**
 * Пропсы ScoreBadge.
 */
interface ScoreBadgeProps {
  /** Оценка книги */
  rating: number | null
  /** Размер рейтинга */
  size?: 'sm' | 'md'
  /** Класс позиционирования в родителе. */
  className?: string | undefined
  /** Функция при нажатии. */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  /** Ref на корневой div — React 19: ref как обычный проп, без forwardRef. */
  ref?: Ref<HTMLDivElement>
}

// md: кольцо и звезда для 10/10 — золотые; sm: scoreColor, CSS-кольцо обложки даёт золотой эффект.
const CONFIG = {
  sm: { dim: 34, r: 14, starSize: 14, ringColor: scoreColor, starFill: '#fff' },
  md: {
    dim: 42,
    r: 18,
    starSize: 13,
    ringColor: (r: number) => (r === 10 ? GOLD_COLOR : scoreColor(r)),
    starFill: GOLD_COLOR,
  },
} satisfies Record<
  string,
  { dim: number; r: number; starSize: number; ringColor: (r: number) => string; starFill: string }
>

/**
 * Круглый бейдж оценки: SVG-кольцо прогресса с числом или звездой в центре.
 */
export const ScoreBadge = ({ rating, size = 'sm', className, onClick, ref }: ScoreBadgeProps) => {
  const { t } = useTranslation()
  const rootClass = [styles['score-badge'], styles[`score-badge--${size}`], className]
    .filter(Boolean)
    .join(' ')

  if (rating === null) {
    return (
      <div ref={ref} className={rootClass} onClick={onClick}>
        <span className={styles['score-badge__empty']}>+</span>
      </div>
    )
  }

  const { dim, r, starSize, ringColor, starFill } = CONFIG[size]
  const cx = dim / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - rating / 10)

  const badge = (
    <div ref={ref} className={rootClass} onClick={onClick}>
      <svg className={styles['score-badge__svg']} viewBox={`0 0 ${dim} ${dim}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={ringColor(rating)}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles['score-badge__content']}>
        {rating === 10 ? (
          <Star size={starSize} fill={starFill} stroke="none" />
        ) : (
          <span className={styles['score-badge__value']}>{rating}</span>
        )}
      </div>
    </div>
  )

  return onClick ? <Tooltip title={t('book.ratingTooltip', { rating })}>{badge}</Tooltip> : badge
}
