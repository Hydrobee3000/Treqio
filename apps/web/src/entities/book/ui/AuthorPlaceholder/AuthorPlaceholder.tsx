import styles from './AuthorPlaceholder.module.scss'

/**
 * Плейсхолдер вместо тире на месте не указанного автора.
 */
export function AuthorPlaceholder() {
  return <span className={styles['author-placeholder']} aria-hidden="true" />
}
