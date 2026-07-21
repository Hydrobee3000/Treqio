import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { showCreate, handleCreate } = useBookExpandModal({ entry, creating, onClose, onCreate })
  const isOpen = !!entry || showCreate

  // Есть ли несохранённые изменения в форме активного дочернего компонента —
  // сообщается через onDirtyChange, чтобы закрытие могло спросить подтверждение.
  const [isDirty, setIsDirty] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)

  // Сброс isDirty при смене записи/режима — прямо во время рендера
  const [prevKey, setPrevKey] = useState<string | boolean>(entry?.id ?? showCreate)
  const currentKey = entry?.id ?? showCreate
  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setIsDirty(false)
  }

  /** Закрывает модалку сразу либо спрашивает подтверждение при несохранённых изменениях. */
  const requestClose = useCallback(() => {
    if (isDirty) {
      setDiscardDialogOpen(true)
    } else {
      onClose()
    }
  }, [isDirty, onClose])

  const handleDiscardConfirmed = () => {
    setDiscardDialogOpen(false)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, requestClose])

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
          onClick={requestClose}
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
                  onClose={requestClose}
                  onDirtyChange={setIsDirty}
                />
              )}
              {showCreate && (
                <BookCreateForm
                  key="em-create"
                  isMobile={isMobile}
                  onCreate={handleCreate}
                  onClose={requestClose}
                  onDirtyChange={setIsDirty}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {discardDialogOpen && (
        <Dialog
          key="em-discard-dialog"
          open={discardDialogOpen}
          onClose={() => setDiscardDialogOpen(false)}
        >
          <DialogTitle>{t('book.modal.discardTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t('book.modal.discardDesc')}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setDiscardDialogOpen(false)}>
              {t('book.modal.keepEditing')}
            </Button>
            <Button variant="contained" color="error" onClick={handleDiscardConfirmed}>
              {t('book.modal.discard')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
