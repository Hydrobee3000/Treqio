/**
 * Статус книги в списке пользователя.
 */
export type BookStatus = 'WANT' | 'READING' | 'DONE' | 'DROPPED'

/**
 * Книга из общего каталога.
 */
export interface Book {
  /** Уникальный идентификатор. */
  id: string
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** URL обложки. */
  coverUrl: string | null
  /** Описание книги. */
  description: string | null
  /** Количество страниц. */
  pageCount: number | null
  /** Жанры книги. */
  genres: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Запись пользователя по конкретной книге.
 */
export interface BookEntry {
  /** Уникальный идентификатор. */
  id: string
  /** Идентификатор пользователя. */
  userId: string
  /** Идентификатор книги. */
  bookId: string
  /** Статус книги в списке пользователя. */
  status: BookStatus
  /** Оценка от 1 до 10. */
  rating: number | null
  /** Текущая страница. */
  progress: number | null
  /** Дата начала чтения. */
  startDate: string | null
  /** Дата завершения чтения. */
  finishDate: string | null
  /** Заметки пользователя. */
  notes: string | null
  createdAt: string
  updatedAt: string
  /** Данные книги (включаются при запросе). */
  book: Book
}
