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

/** Цвет кольца и числа в бейдже оценки — по диапазону. */
function scoreColor(rating: number): string {
  if (rating >= 8) return 'var(--color-primary, #4e7b6a)'
  if (rating >= 6) return 'var(--color-warning, #c49a3a)'
  return '#b94040'
}

/**
 * Круглый бейдж с оценкой (или плейсхолдер если книга не оценена).
 */
function ScoreBadge({ rating }: { rating: number | null }) {
  if (rating === null) {
    return (
      <div className={styles['cover-card__score']}>
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
    <div className={styles['cover-card__score']} title={`Оценка ${rating}/10`}>
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
      <span className={styles['cover-card__score-value']}>{rating}</span>
    </div>
  )
}

/**
 * Пропсы BookCoverCard.
 */
interface BookCoverCardProps {
  /** Запись пользователя с данными книги. */
  entry: BookEntry
}

/**
 * Карточка книги в стиле «обложка» — альтернативный вид BookCard.
 */
export const BookCoverCard = ({ entry }: BookCoverCardProps) => {
  const { book, status, rating, progress } = entry

  const progressPct =
    status === 'READING' && progress !== null && book.pageCount
      ? Math.min(100, Math.round((progress / book.pageCount) * 100))
      : null

  return (
    <div className={styles['cover-card']}>
      <div className={styles['cover-card__cover']}>
        <ScoreBadge rating={rating} />
        <div className={styles['cover-card__title']}>{book.title}</div>
        <div className={styles['cover-card__author']}>{book.author}</div>
      </div>

      <div className={styles['cover-card__footer']}>
        <p className={styles['cover-card__footer-title']}>{book.title}</p>
        <span className={`${styles['cover-card__status']} ${STATUS_CLASS[status]}`}>
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
    </div>
  )
}
