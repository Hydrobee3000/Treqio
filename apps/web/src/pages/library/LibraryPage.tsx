import { useState } from 'react'
import { BookOpen, Image, LayoutGrid } from 'lucide-react'
import { BookCard, BookCoverCard } from '@/entities/book'
import { useGetMyEntriesQuery } from '@/features/book'
import styles from './LibraryPage.module.scss'

/** Стиль отображения карточек книги. */
type CardStyle = 'compact' | 'cover'

export const LibraryPage = () => {
  const [cardStyle, setCardStyle] = useState<CardStyle>('compact')
  const { data, isLoading, isError } = useGetMyEntriesQuery()
  const entries = data ?? []
  const showEmpty = isError || entries.length === 0

  if (isLoading) return null

  return (
    <div className={styles.library}>
      <div className={styles['library__header']}>
        <h1 className={styles['library__title']}>Моя библиотека</h1>
      </div>

      <div className={styles['library__label-row']}>
        <span className={styles['library__label']}>{entries.length} книг</span>

        <div className={styles['library__style-toggle']}>
          <button
            className={`${styles['library__style-btn']} ${cardStyle === 'compact' ? styles['library__style-btn--active'] : ''}`}
            onClick={() => setCardStyle('compact')}
            title="Компактный вид"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`${styles['library__style-btn']} ${cardStyle === 'cover' ? styles['library__style-btn--active'] : ''}`}
            onClick={() => setCardStyle('cover')}
            title="Вид обложками"
          >
            <Image size={16} />
          </button>
        </div>
      </div>

      {showEmpty ? (
        <div className={styles['library__empty']}>
          <div className={styles['library__empty-icon']}>
            <BookOpen size={48} />
          </div>
          <p className={styles['library__empty-text']}>
            {isError ? 'Не удалось загрузить библиотеку' : 'Список книг пуст'}
          </p>
          <p className={styles['library__empty-sub']}>
            {isError ? 'Попробуй обновить страницу' : 'Добавь первую книгу в свою библиотеку'}
          </p>
        </div>
      ) : (
        <div className={styles['library__grid']}>
          {entries.map((entry) =>
            cardStyle === 'compact' ? (
              <BookCard key={entry.id} entry={entry} />
            ) : (
              <BookCoverCard key={entry.id} entry={entry} />
            ),
          )}
        </div>
      )}
    </div>
  )
}
