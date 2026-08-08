import type { MouseEvent, Ref } from 'react'
import { Tooltip } from '@mui/material'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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

/**
 * Квадратный бейдж оценки: небольшая звезда и число.
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

  const badge = (
    <div ref={ref} className={rootClass} onClick={onClick}>
      <div className={styles['score-badge__inner']}>
        <Star className={styles['score-badge__star']} fill="currentColor" strokeWidth={0} />
        <span className={styles['score-badge__value']}>{rating}</span>
      </div>
    </div>
  )

  return onClick ? <Tooltip title={t('book.ratingTooltip', { rating })}>{badge}</Tooltip> : badge
}
