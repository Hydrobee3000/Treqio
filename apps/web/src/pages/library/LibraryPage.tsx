import { useState } from 'react'
import { LayoutGrid, Image } from 'lucide-react'
import { BookCard, BookCoverCard, type BookEntry } from '@/entities/book'
import styles from './LibraryPage.module.scss'

/** Стиль отображения карточек книги. */
type CardStyle = 'compact' | 'cover'

const MOCK_ENTRIES: BookEntry[] = [
  {
    id: '1',
    userId: '1',
    bookId: '1',
    status: 'READING',
    rating: null,
    progress: 120,
    startDate: '2026-01-01',
    finishDate: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    book: {
      id: '1',
      title: 'Мастер и Маргарита',
      author: 'Михаил Булгаков',
      coverUrl: null,
      description: null,
      pageCount: 480,
      genres: ['Роман'],
      createdAt: '',
      updatedAt: '',
    },
  },
  {
    id: '2',
    userId: '1',
    bookId: '2',
    status: 'DONE',
    rating: 9,
    progress: null,
    startDate: '2025-12-01',
    finishDate: '2026-01-15',
    notes: null,
    createdAt: '',
    updatedAt: '',
    book: {
      id: '2',
      title: 'Преступление и наказание',
      author: 'Фёдор Достоевский',
      coverUrl: null,
      description: null,
      pageCount: 592,
      genres: ['Роман'],
      createdAt: '',
      updatedAt: '',
    },
  },
  {
    id: '3',
    userId: '1',
    bookId: '3',
    status: 'WANT',
    rating: null,
    progress: null,
    startDate: null,
    finishDate: null,
    notes: null,
    createdAt: '',
    updatedAt: '',
    book: {
      id: '3',
      title: 'Война и мир',
      author: 'Лев Толстой',
      coverUrl: null,
      description: null,
      pageCount: 1225,
      genres: ['Роман'],
      createdAt: '',
      updatedAt: '',
    },
  },
]

export const LibraryPage = () => {
  const [cardStyle, setCardStyle] = useState<CardStyle>('compact')

  return (
    <div className={styles.library}>
      <div className={styles['library__header']}>
        <h1 className={styles['library__title']}>Моя библиотека</h1>
      </div>

      <div className={styles['library__label-row']}>
        <span className={styles['library__label']}>{MOCK_ENTRIES.length} книг</span>

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

      <div className={styles['library__grid']}>
        {MOCK_ENTRIES.map((entry) =>
          cardStyle === 'compact' ? (
            <BookCard key={entry.id} entry={entry} />
          ) : (
            <BookCoverCard key={entry.id} entry={entry} />
          ),
        )}
      </div>
    </div>
  )
}
