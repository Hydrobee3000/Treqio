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
  /** Создаёт книгу и закрывает модалку. */
  const handleCreate = async (payload: CreateBookPayload) => {
    await onCreate?.(payload)
    onClose()
  }

  return {
    showCreate: !entry && creating,
    handleCreate,
  }
}
