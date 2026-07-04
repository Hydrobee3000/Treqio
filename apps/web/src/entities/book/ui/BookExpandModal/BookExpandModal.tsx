import { AnimatePresence, motion } from 'framer-motion'
import { useMediaQuery, useTheme } from '@mui/material'
import type { BookEntry, BookStatus } from '../../model/book.types'
import { BookCreateForm } from './BookCreateForm'
import { BookEntryView } from './BookEntryView'
import { useBookExpandModal } from './useBookExpandModal'
import styles from './BookExpandModal.module.scss'
import type { BookFieldUpdate, EntryFieldUpdate, CreateBookPayload } from './BookExpandModal.types'

export type { BookFieldUpdate, EntryFieldUpdate, CreateBookPayload }

/**
 * Пропсы BookExpandModal.
 */
interface BookExpandModalProps {
  /** Запись для просмотра/редактирования. null — модалка закрыта (если не creating). */
  entry: BookEntry | null
  /** Режим создания новой книги. */
  creating?: boolean
  /** Закрытие модалки. */
  onClose: () => void
  /** Сохранение полей книги. */
  onSaveBook?: (dto: BookFieldUpdate) => Promise<void>
  /** Сохранение полей записи. */
  onSaveEntry?: (dto: EntryFieldUpdate) => Promise<void>
  /** Создание новой книги. */
  onCreate?: (payload: CreateBookPayload) => Promise<void>
  /** Удаление записи. */
  onDelete?: () => Promise<void>
  /** Быстрая смена статуса. */
  onStatusChange?: (status: BookStatus) => void
}

/**
 * Модальное окно книги — просмотр/редактирование существующей записи или создание новой.
 */
export const BookExpandModal = ({
  entry,
  creating = false,
  onClose,
  onSaveBook,
  onSaveEntry,
  onCreate,
  onDelete,
  onStatusChange,
}: BookExpandModalProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { showCreate, handleClose, handleLayoutAnimationComplete, handleCreate } =
    useBookExpandModal({ entry, creating, onClose, onCreate })

  return (
    <AnimatePresence>
      {(entry || showCreate) && (
        <motion.div
          key="em-backdrop"
          className={styles['em__backdrop']}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleClose}
        >
          <div
            className={`${styles['em__centering']} ${isMobile ? styles['em__centering--mobile'] : ''}`}
            style={{ pointerEvents: 'none' }}
          >
            <AnimatePresence>
              {entry && (
                <BookEntryView
                  key={`em-${entry.id}`}
                  entry={entry}
                  isMobile={isMobile}
                  onSaveBook={onSaveBook}
                  onSaveEntry={onSaveEntry}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onClose={onClose}
                  handleClose={handleClose}
                  onLayoutAnimationComplete={handleLayoutAnimationComplete}
                />
              )}
              {showCreate && (
                <BookCreateForm
                  key="em-create"
                  isMobile={isMobile}
                  onCreate={handleCreate}
                  onClose={onClose}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
