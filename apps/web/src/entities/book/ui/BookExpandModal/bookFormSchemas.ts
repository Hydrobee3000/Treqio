import { z } from 'zod'

// Допустимые значения статуса книги.
const BOOK_STATUS_VALUES = ['WANT', 'READING', 'DROPPED', 'DONE'] as const

/**
 * Схема валидации формы создания книги.
 */
export const createBookSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  author: z.string(),
  pageCount: z.string(),
  description: z.string(),
  status: z.enum(BOOK_STATUS_VALUES),
  rating: z.number().min(1).max(10),
  progress: z.number().min(0),
  notes: z.string(),
})

/**
 * Значения формы создания книги.
 */
export type CreateFormValues = z.infer<typeof createBookSchema>

/**
 * Схема валидации формы редактирования записи.
 */
export const editBookSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  author: z.string(),
  pageCount: z.string(),
  description: z.string(),
  notes: z.string(),
  rating: z.number().min(1).max(10),
  progress: z.number().min(0),
})

/**
 * Значения формы редактирования записи.
 */
export type EditFormValues = z.infer<typeof editBookSchema>
