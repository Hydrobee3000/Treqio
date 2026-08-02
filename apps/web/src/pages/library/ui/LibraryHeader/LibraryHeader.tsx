import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './LibraryHeader.module.scss'

/** Свойства LibraryHeader. */
interface Props {
  /** Колбэк клика по кнопке добавления книги. */
  onAddClick: () => void
}

/**
 * Заголовок страницы библиотеки с кнопкой добавления книги.
 */
export function LibraryHeader({ onAddClick }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles['library__header']}>
      <h1 className={styles['library__title']}>{t('library.title')}</h1>
      <button className={styles['library__add-btn']} onClick={onAddClick}>
        <Plus size={16} />
        <span className={styles['library__add-btn-label']}>{t('library.addBook')}</span>
      </button>
    </div>
  )
}
