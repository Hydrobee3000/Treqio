import type { Book, BookStatus } from '@/entities/book'
import type { PublicUser } from '@/features/user'
import { baseApi } from '@/shared/api/baseApi'

/**
 * Тип события журнала активности.
 */
export type ActivityType = 'ENTRY_ADDED' | 'STATUS_CHANGED' | 'RATED'

/**
 * Подробности события о добавлении записи в список.
 */
export interface EntryAddedPayload {
  /** Статус, с которым запись была добавлена. */
  status: BookStatus
}

/**
 * Подробности события о смене статуса записи.
 */
export interface StatusChangedPayload {
  /** Статус до изменения. */
  from: BookStatus
  /** Статус после изменения. */
  to: BookStatus
}

/**
 * Подробности события об оценке записи.
 */
export interface RatedPayload {
  /** Новая оценка — null, если оценку сняли. */
  rating: number | null
  /** Оценка до изменения — null, если её не было. */
  previous: number | null
}

/**
 * Книга события — только поля, нужные для отображения в ленте.
 */
export type FeedBook = Pick<Book, 'id' | 'title'>

/**
 * Запись, к которой относится событие ленты.
 */
export interface FeedBookEntry {
  /** Идентификатор записи. */
  id: string
  /** Книга записи. */
  book: FeedBook
}

/**
 * Одно событие в ленте друзей.
 */
export interface FeedItem {
  /** Идентификатор события. */
  id: string
  /** Тип события. */
  type: ActivityType
  /** Подробности события — форма зависит от type. */
  payload: EntryAddedPayload | StatusChangedPayload | RatedPayload
  /** Дата события (ISO 8601). */
  createdAt: string
  /** Автор события. */
  user: PublicUser
  /** Запись, к которой относится событие. */
  bookEntry: FeedBookEntry
}

/**
 * Порция ленты друзей с курсором для следующей.
 */
export interface FeedPage {
  /** События порции, от новых к старым. */
  items: FeedItem[]
  /** Курсор следующей порции — null, если лента закончилась. */
  nextCursor: string | null
}

/**
 * API ленты активности друзей.
 */
export const activityApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Порция ленты друзей начиная с курсора.
     */
    getFeed: build.query<FeedPage, string | undefined>({
      query: (cursor) =>
        cursor ? { url: '/activity/feed', params: { cursor } } : '/activity/feed',
      providesTags: ['Feed'],
    }),
  }),
})

export const { useGetFeedQuery, useLazyGetFeedQuery } = activityApi
