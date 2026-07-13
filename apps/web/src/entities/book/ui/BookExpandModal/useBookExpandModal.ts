import { useEffect, useRef } from 'react'
import type { BookEntry } from '../../model/book.types'
import type { CreateBookPayload } from './BookExpandModal.types'

/**
 * Пропсы хука useBookExpandModal.
 */
interface UseBookExpandModalParams {
  /** Запись для просмотра/редактирования. */
  entry: BookEntry | null
  /** Флаг режима создания новой книги. */
  creating: boolean
  /** Функция закрытия модалки. */
  onClose: () => void
  /** Функция создания новой книги. */
  onCreate?: ((payload: CreateBookPayload) => Promise<void>) | undefined
  /** Есть ли в DOM источник layout-анимации (BookCoverCard с matching layoutId). */
  hasLayoutSource?: boolean
}

/**
 * Управляет анимационным shell'ом модалки и созданием книги.
 * Состояние редактирования и удаления — в BookEntryView.
 */
export const useBookExpandModal = ({
  entry,
  creating,
  onClose,
  onCreate,
  hasLayoutSource = true,
}: UseBookExpandModalParams) => {
  // Предотвращает закрытие до завершения opening layout-анимации (shared element).
  // Если источника анимации нет (table view) — считаем сразу завершённой.
  const openAnimationCompleteRef = useRef(false)
  const pendingCloseRef = useRef(false)

  useEffect(() => {
    openAnimationCompleteRef.current = !hasLayoutSource
    pendingCloseRef.current = false
  }, [entry?.id, hasLayoutSource])

  /** Закрывает модалку. Если layout-анимация открытия ещё идёт — откладывает закрытие. */
  const handleClose = () => {
    // Для формы создания (entry = null) layout-анимации нет — закрываем сразу.
    if (!entry || openAnimationCompleteRef.current) {
      onClose()
    } else {
      pendingCloseRef.current = true
    }
  }

  /** Обработчик завершения layout-анимации открытия. */
  const handleLayoutAnimationComplete = () => {
    openAnimationCompleteRef.current = true
    if (pendingCloseRef.current) {
      pendingCloseRef.current = false
      onClose()
    }
  }

  /** Создаёт книгу и закрывает модалку. */
  const handleCreate = async (payload: CreateBookPayload) => {
    await onCreate?.(payload)
    onClose()
  }

  return {
    showCreate: !entry && creating,
    handleClose,
    handleLayoutAnimationComplete,
    handleCreate,
  }
}
