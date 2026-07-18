import { z } from 'zod'
import type { TFunction } from 'i18next'

// Допустимые значения статуса книги.
const BOOK_STATUS_VALUES = ['WANT', 'READING', 'DROPPED', 'DONE'] as const

/**
 * Схема валидации формы создания книги.
 */
export const createBookSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('book.modal.titleRequiredError')),
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
export type CreateFormValues = z.infer<ReturnType<typeof createBookSchema>>

/**
 * Схема валидации формы редактирования записи.
 */
export const editBookSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('book.modal.titleRequiredError')),
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
export type EditFormValues = z.infer<ReturnType<typeof editBookSchema>>
