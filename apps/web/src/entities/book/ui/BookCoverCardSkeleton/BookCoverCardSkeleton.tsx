import Skeleton from '@mui/material/Skeleton'
import styles from './BookCoverCardSkeleton.module.scss'

/** Размер карточки-скелетона — совпадает с размером BookCoverCard. */
type CardSize = 'compact' | 'medium' | 'large'

/**
 * Свойства BookCoverCardSkeleton.
 */
interface BookCoverCardSkeletonProps {
  /** Размер карточки. По умолчанию «large». */
  size?: CardSize
}

/**
 * Скелетон карточки книги в стиле «обложка» — повторяет форму BookCoverCard.
 */
export const BookCoverCardSkeleton = ({ size = 'large' }: BookCoverCardSkeletonProps) => (
  <div className={`${styles['card-skeleton']} ${styles[`card-skeleton--${size}`] ?? ''}`}>
    <Skeleton
      variant="rounded"
      sx={{ width: '100%', aspectRatio: '2/3', height: 'auto', borderRadius: '10px' }}
    />
    <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: '999px' }} />
  </div>
)
