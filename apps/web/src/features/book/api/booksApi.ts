import { baseApi } from '@/shared/api/baseApi'
import type { Book, BookEntry, BookStatus } from '@/entities/book'

/**
 * Данные для создания книги.
 */
export interface CreateBookDto {
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** URL обложки. */
  coverUrl?: string
  /** Описание книги. */
  description?: string
  /** Количество страниц. */
  pageCount?: number
  /** Жанры книги. */
  genres?: string[]
}

/**
 * Данные для обновления книги — все поля необязательны.
 */
export type UpdateBookDto = Partial<CreateBookDto>

/**
 * Данные для добавления книги в список пользователя.
 */
export interface CreateBookEntryDto {
  /** Идентификатор книги. */
  bookId: string
  /** Начальный статус книги. */
  status: BookStatus
}

/**
 * Данные для обновления записи о книге пользователя.
 */
export interface UpdateBookEntryDto {
  /** Статус книги в списке. */
  status?: BookStatus
  /** Оценка от 1 до 10. */
  rating?: number
  /** Текущая страница. */
  progress?: number
  /** Дата начала чтения. */
  startDate?: string
  /** Дата завершения чтения. */
  finishDate?: string
  /** Заметки пользователя. */
  notes?: string
}

/**
 * API книг и записей пользователя.
 */
export const booksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Список всех книг каталога.
     */
    getBooks: build.query<Book[], void>({
      query: () => '/books',
      providesTags: ['Book'],
    }),

    /**
     * Записи текущего пользователя (с вложенными данными книги).
     */
    getMyEntries: build.query<BookEntry[], void>({
      query: () => '/books/entries/me',
      providesTags: ['Book'],
    }),

    /**
     * Добавление книги в общий каталог.
     */
    createBook: build.mutation<Book, CreateBookDto>({
      query: (body) => ({ url: '/books', method: 'POST', body }),
      invalidatesTags: ['Book'],
    }),

    /**
     * Обновление книги по ID.
     */
    updateBook: build.mutation<Book, { id: string; dto: UpdateBookDto }>({
      query: ({ id, dto }) => ({ url: `/books/${id}`, method: 'PATCH', body: dto }),
      invalidatesTags: ['Book'],
    }),

    /**
     * Удаление книги по ID.
     */
    deleteBook: build.mutation<void, string>({
      query: (id) => ({ url: `/books/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Book'],
    }),

    /**
     * Добавление книги в список пользователя.
     */
    createEntry: build.mutation<BookEntry, CreateBookEntryDto>({
      query: (body) => ({ url: '/books/entries', method: 'POST', body }),
      invalidatesTags: ['Book'],
    }),

    /**
     * Обновление записи пользователя по ID (статус, оценка, прогресс и т.д.).
     */
    updateEntry: build.mutation<BookEntry, { id: string; dto: UpdateBookEntryDto }>({
      query: ({ id, dto }) => ({ url: `/books/entries/${id}`, method: 'PATCH', body: dto }),
      invalidatesTags: ['Book'],
      // Меняем запись в кэше сразу, не дожидаясь ответа сервера — иначе при
      // медленном ответе элементы интерфейса (например поп-овер оценки на
      // карточке) остаются в состоянии ожидания и могут вести себя не так,
      // как ожидается. Если запрос всё же завершится ошибкой — откатываем.
      async onQueryStarted({ id, dto }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          booksApi.util.updateQueryData('getMyEntries', undefined, (draft) => {
            const entry = draft.find((e) => e.id === id)
            if (entry) Object.assign(entry, dto)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    /**
     * Удаление записи пользователя по ID.
     */
    deleteEntry: build.mutation<void, string>({
      query: (id) => ({ url: `/books/entries/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Book'],
    }),
  }),
})

export const {
  useGetBooksQuery,
  useGetMyEntriesQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
} = booksApi
