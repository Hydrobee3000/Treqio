import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { BookEntry, BookStatus } from '../../model/book.types'
import type { BookFieldUpdate, CreateBookPayload, EntryFieldUpdate } from './BookExpandModal.types'

/** Черновик формы создания книги. */
export interface CreateDraft {
  /** Название. */
  title: string
  /** Автор. */
  author: string
  /** Количество страниц. */
  pageCount: string
  /** Описание. */
  description: string
  /** Статус чтения. */
  status: BookStatus
  /** Оценка (1–10). */
  rating: string
  /** Прочитано страниц. */
  progress: string
  /** Заметки. */
  notes: string
}

export const DEFAULT_CREATE: CreateDraft = {
  title: '',
  author: '',
  pageCount: '',
  description: '',
  status: 'WANT',
  rating: '',
  progress: '',
  notes: '',
}

/** Пропсы хука useBookExpandModal. */
interface UseBookExpandModalParams {
  /** Запись для просмотра/редактирования. */
  entry: BookEntry | null
  /** Режим создания новой книги. */
  creating: boolean
  /** Закрытие модалки. */
  onClose: () => void
  /** Сохранение поля книги. */
  onSaveBook?: ((dto: BookFieldUpdate) => Promise<void>) | undefined
  /** Сохранение поля записи. */
  onSaveEntry?: ((dto: EntryFieldUpdate) => Promise<void>) | undefined
  /** Создание новой книги. */
  onCreate?: ((payload: CreateBookPayload) => Promise<void>) | undefined
  /** Удаление записи. */
  onDelete?: (() => Promise<void>) | undefined
  /** Быстрая смена статуса. */
  onStatusChange?: ((status: BookStatus) => void) | undefined
}

/**
 * Вся логика модального окна книги: состояние, вычисляемые значения и обработчики.
 */
export const useBookExpandModal = ({
  entry,
  creating,
  onClose,
  onSaveBook,
  onSaveEntry,
  onCreate,
  onDelete,
  onStatusChange,
}: UseBookExpandModalParams) => {
  const closingRef = useRef(false)
  // Предотвращает закрытие до завершения открывающей layout-анимации (shared element).
  // Если пользователь закрывает раньше — вызов откладывается до onLayoutAnimationComplete.
  const openAnimationCompleteRef = useRef(false)
  const pendingCloseRef = useRef(false)

  /** Закрывает модалку. */
  const triggerClose = () => {
    if (openAnimationCompleteRef.current) {
      onClose()
    } else {
      pendingCloseRef.current = true
    }
  }

  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldDraft, setFieldDraft] = useState('')
  const [ratingDraft, setRatingDraft] = useState(0)
  const [progressDraft, setProgressDraft] = useState(0)
  const [localStatus, setLocalStatus] = useState<BookStatus | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [createDraft, setCreateDraft] = useState<CreateDraft>(DEFAULT_CREATE)
  const [prevEntryId, setPrevEntryId] = useState(entry?.id)
  const [prevCreating, setPrevCreating] = useState(creating)

  // Сброс полей при открытии новой записи.
  if (entry?.id !== prevEntryId) {
    setPrevEntryId(entry?.id)
    setLocalStatus(null)
    setEditingField(null)
    setFieldDraft('')
    setError(null)
    setDeleteConfirm(false)
    setStatusOpen(false)
  }

  // Сброс черновика формы создания при закрытии.
  if (creating !== prevCreating) {
    setPrevCreating(creating)
    if (!creating) setCreateDraft(DEFAULT_CREATE)
    setError(null)
  }

  useEffect(() => {
    closingRef.current = false
    openAnimationCompleteRef.current = false
    pendingCloseRef.current = false
  }, [entry?.id])

  const displayStatus = localStatus ?? entry?.status ?? 'WANT'
  const progressPct =
    entry?.status === 'READING' && entry.progress !== null && entry.book.pageCount
      ? Math.min(100, Math.round((entry.progress / entry.book.pageCount) * 100))
      : null

  // ── Инлайн-редактирование ───────────────────────────────────────────────────

  /** Открывает редактирование поля. */
  const startEdit = (field: string, value: string) => {
    setEditingField(field)
    setFieldDraft(value)
    setStatusOpen(false)
    setError(null)
  }

  /** Обработчик клавиш в однострочных полях ввода. */
  const handleInputKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    onEnter: () => void,
    originalValue: string,
  ) => {
    if (e.key === 'Enter') onEnter()
    else if (e.key === 'Escape') {
      setFieldDraft(originalValue)
      setEditingField(null)
    }
  }

  /** Обработчик клавиш в многострочных полях ввода. */
  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, originalValue: string) => {
    if (e.key === 'Escape') {
      setFieldDraft(originalValue)
      setEditingField(null)
    }
  }

  /** Сохраняет поле книги. */
  const commitBookField = async (
    field: 'title' | 'author' | 'pageCount' | 'description',
    originalValue: string,
  ) => {
    if (closingRef.current) return
    setEditingField(null)
    const trimmed = fieldDraft.trim()
    if (trimmed === originalValue) return
    if (!trimmed) return
    try {
      if (field === 'pageCount') {
        await onSaveBook?.({ pageCount: Number(trimmed) })
      } else {
        await onSaveBook?.({ [field]: trimmed })
      }
    } catch {
      setError('Не удалось сохранить')
    }
  }

  /** Сохраняет заметки. */
  const commitNotes = async (originalValue: string) => {
    if (closingRef.current) return
    setEditingField(null)
    const trimmed = fieldDraft.trim()
    if (trimmed === originalValue) return
    if (!trimmed) return
    try {
      await onSaveEntry?.({ notes: trimmed })
    } catch {
      setError('Не удалось сохранить')
    }
  }

  /** Сохраняет оценку. */
  const commitRating = async () => {
    if (closingRef.current) return
    setEditingField(null)
    if (ratingDraft === (entry?.rating ?? 0)) return
    if (!ratingDraft) return
    try {
      await onSaveEntry?.({ rating: ratingDraft })
    } catch {
      setError('Не удалось сохранить')
    }
  }

  /** Сохраняет прогресс чтения. */
  const commitProgress = async () => {
    if (closingRef.current) return
    setEditingField(null)
    if (progressDraft === (entry?.progress ?? 0)) return
    try {
      await onSaveEntry?.({ progress: progressDraft })
    } catch {
      setError('Не удалось сохранить')
    }
  }

  // ── Статус ──────────────────────────────────────────────────────────────────

  /** Обработчик выбора статуса. */
  const handleStatusSelect = (status: BookStatus) => {
    setStatusOpen(false)
    setLocalStatus(status)
    onStatusChange?.(status)
  }

  // ── Удаление ────────────────────────────────────────────────────────────────

  /** Обработчик клика по кнопке удаления. */
  const handleDeleteClick = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    void handleDeleteConfirmed()
  }

  /** Обработчик подтверждения удаления. */
  const handleDeleteConfirmed = async () => {
    setIsDeleting(true)
    try {
      await onDelete?.()
      onClose()
    } catch {
      setError('Не удалось удалить. Попробуй ещё раз.')
      setIsDeleting(false)
      setDeleteConfirm(false)
    }
  }

  // ── Создание ────────────────────────────────────────────────────────────────

  /** Обработчик создания новой книги. */
  const handleCreate = async () => {
    if (!createDraft.title.trim()) return
    setIsSubmitting(true)
    setError(null)
    const hasPageCount = !!(createDraft.pageCount && Number(createDraft.pageCount) > 0)
    try {
      await onCreate?.({
        title: createDraft.title.trim(),
        author: createDraft.author.trim() || 'Автор неизвестен',
        ...(hasPageCount && { pageCount: Number(createDraft.pageCount) }),
        ...(createDraft.description.trim() && { description: createDraft.description.trim() }),
        status: createDraft.status,
        ...(createDraft.status === 'DONE' &&
          createDraft.rating && { rating: Number(createDraft.rating) }),
        ...((createDraft.status === 'READING' || createDraft.status === 'DROPPED') &&
          hasPageCount &&
          createDraft.progress && { progress: Number(createDraft.progress) }),
        ...(createDraft.notes.trim() && { notes: createDraft.notes.trim() }),
      })
      onClose()
    } catch {
      setError('Не удалось добавить книгу. Попробуй ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Закрытие ────────────────────────────────────────────────────────────────

  /** Обработчик mousedown на элементах закрытия (бэкдроп, кнопка ×). */
  const handleCloseMouseDown = () => {
    closingRef.current = true
  }

  /** Обработчик click на элементах закрытия (бэкдроп, кнопка ×). */
  const handleCloseClick = () => {
    closingRef.current = false
    triggerClose()
  }

  /** Обработчик завершения layout-анимации открытия. */
  const handleLayoutAnimationComplete = () => {
    openAnimationCompleteRef.current = true
    if (pendingCloseRef.current) {
      pendingCloseRef.current = false
      onClose()
    }
  }

  // ── Вычисляемые значения для формы создания ─────────────────────────────────

  const showCreate = !entry && creating
  const hasCreatePageCount = !!(createDraft.pageCount && Number(createDraft.pageCount) > 0)
  const showCreateProgress =
    (createDraft.status === 'READING' || createDraft.status === 'DROPPED') && hasCreatePageCount
  const createRatingVal = createDraft.rating ? Number(createDraft.rating) : 0

  return {
    // Состояние
    editingField,
    fieldDraft,
    ratingDraft,
    progressDraft,
    statusOpen,
    isSubmitting,
    isDeleting,
    error,
    deleteConfirm,
    createDraft,
    // Вычисляемые значения
    displayStatus,
    progressPct,
    showCreate,
    hasCreatePageCount,
    showCreateProgress,
    createRatingVal,
    // Сеттеры, используемые напрямую в JSX
    setEditingField,
    setFieldDraft,
    setRatingDraft,
    setProgressDraft,
    setStatusOpen,
    setDeleteConfirm,
    setCreateDraft,
    // Обработчики
    handleCloseMouseDown,
    handleCloseClick,
    handleLayoutAnimationComplete,
    startEdit,
    handleInputKeyDown,
    handleTextareaKeyDown,
    commitBookField,
    commitNotes,
    commitRating,
    commitProgress,
    handleStatusSelect,
    handleDeleteClick,
    handleCreate,
  }
}
