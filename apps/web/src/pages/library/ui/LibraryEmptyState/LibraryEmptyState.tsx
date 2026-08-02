import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './LibraryEmptyState.module.scss'

/** Свойства LibraryEmptyState. */
interface Props {
  /** Колбэк клика по кнопке добавления книги. */
  onAddClick: () => void
}

/**
 * Иллюстрация и приглашение добавить первую книгу — показывается, когда в
 * библиотеке пользователя пока нет ни одной записи.
 */
export function LibraryEmptyState({ onAddClick }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles['library__empty-lib']}>
      <div className={styles['library__empty-shelf']}>
        <div className={styles['library__ghost']} />
        <div className={`${styles['library__ghost']} ${styles['library__ghost--tall']}`} />
        <div className={`${styles['library__ghost']} ${styles['library__ghost--accent']}`} />
        <div className={`${styles['library__ghost']} ${styles['library__ghost--tall']}`} />
        <div className={styles['library__ghost']} />
      </div>
      <h2 className={styles['library__empty-title']}>{t('library.empty.title')}</h2>
      <p className={styles['library__empty-desc']}>{t('library.empty.desc')}</p>
      <div className={styles['library__empty-actions']}>
        <button className={styles['library__cta-primary']} onClick={onAddClick}>
          <Plus size={17} />
          {t('library.empty.addBook')}
        </button>
      </div>
    </div>
  )
}
