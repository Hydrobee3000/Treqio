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
}

/**
 * Управляет созданием книги. Состояние редактирования и удаления — в BookEntryView.
 */
export const useBookExpandModal = ({
  entry,
  creating,
  onClose,
  onCreate,
}: UseBookExpandModalParams) => {
  /**
   * Закрывает модалку сразу, не дожидаясь ответа сервера — запрос
   * доделывается в фоне.
   */
  const handleCreate = async (payload: CreateBookPayload) => {
    onCreate?.(payload).catch(() => {
      // Ошибка не показывается — модалка уже закрыта. Уведомление об исходе
      // придёт отдельной задачей.
    })
    onClose()
  }

  return {
    showCreate: !entry && creating,
    handleCreate,
  }
}
