import styles from './BookTitleChip.module.scss'

/**
 * Свойства BookTitleChip.
 */
interface BookTitleChipProps {
  /** Название книги. */
  title: string
}

/**
 * Пилюля с названием книги — акцент основным цветом темы.
 */
export function BookTitleChip({ title }: BookTitleChipProps) {
  return <span className={styles['book-title-chip']}>{title}</span>
}
