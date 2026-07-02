/**
 * Человекочитаемые названия статусов книги.
 * Источник правды для ключей статуса — `BookStatus` выводится из этого объекта.
 */
export const STATUS_LABEL = {
  WANT: 'Прочитаю',
  READING: 'Читаю',
  DONE: 'Прочитано',
  DROPPED: 'Брошено',
} as const

/**
 * Статус книги в списке пользователя.
 */
export type BookStatus = keyof typeof STATUS_LABEL

/**
 * Цвет текста/бордера для статусной кнопки в модалке и профиле.
 */
export const STATUS_TEXT_COLOR: Record<BookStatus, string> = {
  WANT: '#9c8a6a',
  READING: '#4a92bd',
  DONE: '#3d8a5c',
  DROPPED: '#b94040',
}

/**
 * Цвет точки и пилюли статуса в карточках и таблице.
 */
export const STATUS_DOT_COLOR: Record<BookStatus, string> = {
  WANT: '#9c8a6a',
  READING: '#5aa0c8',
  DONE: '#4caf6e',
  DROPPED: '#b94040',
}

/**
 * Варианты статуса для быстрого выбора (пикеры, чипы).
 */
export const STATUS_OPTIONS: { value: BookStatus; label: string }[] = Object.entries(
  STATUS_LABEL,
).map(([value, label]) => ({ value: value as BookStatus, label }))

/**
 * Цвет звезды идеальной оценки 10/10.
 */
export const GOLD_COLOR = '#ffd24a'

/**
 * Цвет кольца и числа в бейдже оценки — зависит от диапазона.
 */
export function scoreColor(rating: number): string {
  if (rating >= 8) return '#5e9b84'
  if (rating >= 6) return '#c49a3a'
  return '#b94040'
}

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
  /** Дата создания записи (ISO 8601). */
  createdAt: string
  /** Дата последнего изменения записи (ISO 8601). */
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
  /** Дата последнего изменения оценки. */
  ratingUpdatedAt: string | null
  /** Дата последнего изменения статуса. */
  statusUpdatedAt: string | null
  /** Заметки пользователя. */
  notes: string | null
  /** Дата создания записи (ISO 8601). */
  createdAt: string
  /** Дата последнего изменения записи (ISO 8601). */
  updatedAt: string
  /** Данные книги (включаются при запросе). */
  book: Book
}
