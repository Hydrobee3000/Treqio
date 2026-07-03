import type { BookStatus } from '../../model/book.types'

/**
 * Поля книги (book), обновляемые по одному.
 */
export interface BookFieldUpdate {
  /** Название. */
  title?: string
  /** Автор. */
  author?: string
  /** Количество страниц. */
  pageCount?: number
  /** Описание. */
  description?: string
}

/**
 * Поля записи пользователя (entry), обновляемые по одному.
 */
export interface EntryFieldUpdate {
  /** Статус чтения. */
  status?: BookStatus
  /** Оценка (1–10). */
  rating?: number
  /** Прочитано страниц. */
  progress?: number
  /** Заметки. */
  notes?: string
}

/**
 * Данные для создания новой книги и записи.
 */
export interface CreateBookPayload {
  /** Название. */
  title: string
  /** Автор. */
  author: string
  /** Количество страниц. */
  pageCount?: number
  /** Описание. */
  description?: string
  /** Статус чтения. */
  status: BookStatus
  /** Оценка (1–10). */
  rating?: number
  /** Прочитано страниц. */
  progress?: number
  /** Заметки. */
  notes?: string
}
