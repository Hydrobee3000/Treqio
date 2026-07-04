import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Check, Pencil, Star, Trash2, X } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import {
  GOLD_COLOR,
  STATUS_LABEL,
  STATUS_OPTIONS,
  STATUS_TEXT_COLOR,
  scoreColor,
} from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import { ScoreBadge } from '../ScoreBadge/ScoreBadge'
import type { BookFieldUpdate, EntryFieldUpdate } from './BookExpandModal.types'
import styles from './BookExpandModal.module.scss'

/**
 * Значения формы редактирования записи.
 */
interface EditFormValues {
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** Количество страниц (строка, конвертируется при отправке). */
  pageCount: string
  /** Описание книги. */
  description: string
  /** Заметки пользователя. */
  notes: string
  /** Оценка (1–10). */
  rating: number
  /** Прочитано страниц. */
  progress: number
}

/**
 * Пропсы BookEntryView.
 */
interface BookEntryViewProps {
  /** Запись пользователя с данными книги. */
  entry: BookEntry
  /** Флаг адаптации под мобильный экран. */
  isMobile: boolean
  /** Функция сохранения полей книги. */
  onSaveBook?: ((dto: BookFieldUpdate) => Promise<void>) | undefined
  /** Функция сохранения полей записи. */
  onSaveEntry?: ((dto: EntryFieldUpdate) => Promise<void>) | undefined
  /** Функция удаления записи. */
  onDelete?: (() => Promise<void>) | undefined
  /** Функция смены статуса (немедленная, без формы). */
  onStatusChange?: ((status: BookStatus) => void) | undefined
  /** Функция закрытия модалки (прямая, без layout-анимации). */
  onClose: () => void
  /** Функция закрытия с учётом layout-анимации открытия. */
  handleClose: () => void
  /** Функция обратного вызова при завершении layout-анимации. */
  onLayoutAnimationComplete: () => void
}

/** Форматирует дату для отображения. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Просмотр и редактирование существующей записи книги.
 * Использует shared-element (layoutId) анимацию входа/выхода.
 */
export const BookEntryView = ({
  entry,
  isMobile,
  onSaveBook,
  onSaveEntry,
  onDelete,
  onStatusChange,
  onClose,
  handleClose,
  onLayoutAnimationComplete,
}: BookEntryViewProps) => {
  const [localStatus, setLocalStatus] = useState<BookStatus | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const displayStatus = localStatus ?? entry.status

  const progressPct =
    displayStatus === 'READING' && entry.progress !== null && entry.book.pageCount
      ? Math.min(100, Math.round((entry.progress / entry.book.pageCount) * 100))
      : null

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, dirtyFields },
  } = useForm<EditFormValues>({
    defaultValues: {
      title: entry.book.title,
      author: entry.book.author,
      pageCount: entry.book.pageCount ? String(entry.book.pageCount) : '',
      description: entry.book.description ?? '',
      notes: entry.notes ?? '',
      rating: entry.rating ?? 5,
      progress: entry.progress ?? 0,
    },
  })

  const [ratingVal, progressVal] = useWatch({ control, name: ['rating', 'progress'] })

  const onEditSubmit = handleSubmit(async (values) => {
    setSaveError(null)
    try {
      const bookUpdate: BookFieldUpdate = {}
      if (dirtyFields.title && values.title.trim()) bookUpdate.title = values.title.trim()
      if (dirtyFields.author && values.author.trim()) bookUpdate.author = values.author.trim()
      if (dirtyFields.pageCount && values.pageCount) bookUpdate.pageCount = Number(values.pageCount)
      if (dirtyFields.description) bookUpdate.description = values.description.trim()

      const entryUpdate: EntryFieldUpdate = {}
      if (dirtyFields.notes) entryUpdate.notes = values.notes.trim()
      if (dirtyFields.rating && displayStatus === 'DONE') entryUpdate.rating = values.rating
      if (dirtyFields.progress && (displayStatus === 'READING' || displayStatus === 'DROPPED'))
        entryUpdate.progress = values.progress

      if (Object.keys(bookUpdate).length > 0) await onSaveBook?.(bookUpdate)
      if (Object.keys(entryUpdate).length > 0) await onSaveEntry?.(entryUpdate)

      setIsEditing(false)
    } catch {
      setSaveError('Не удалось сохранить')
    }
  })

  const handleCancelEdit = () => {
    reset()
    setIsEditing(false)
    setSaveError(null)
  }

  const handleStatusSelect = (status: BookStatus) => {
    setStatusOpen(false)
    setLocalStatus(status)
    onStatusChange?.(status)
  }

  const handleDeleteClick = () => {
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true)
    try {
      await onDelete?.()
      setDeleteDialogOpen(false)
      onClose()
    } catch {
      setDeleteError('Не удалось удалить. Попробуй ещё раз.')
      setIsDeleting(false)
    }
  }

  const handleDeleteDialogClose = () => {
    if (isDeleting) return
    setDeleteError(null)
    setDeleteDialogOpen(false)
  }

  return (
    <motion.div
      layoutId={`book-cover-${entry.id}`}
      className={`${styles['em__modal']} ${isMobile ? styles['em__modal--mobile'] : ''}`}
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      onLayoutAnimationComplete={onLayoutAnimationComplete}
    >
      <div className={styles['em__hero']}>
        <button className={styles['em__close']} onClick={handleClose}>
          <X size={15} />
        </button>
        {isEditing ? (
          <span className={styles['em__mode-label']}>Редактирование</span>
        ) : (
          entry.status === 'DONE' &&
          entry.rating !== null && (
            <ScoreBadge rating={entry.rating} size="md" className={styles['em__score']} />
          )
        )}
      </div>

      <motion.div
        className={styles['em__content']}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.22 } }}
      >
        <div className={styles['em__scroll']}>
          <div className={styles['em__body']}>
            {isEditing ? (
              /* ── Режим редактирования ── */
              <>
                <div className={styles['em__field']}>
                  <label className={styles['em__field-label']}>Название</label>
                  <input
                    className={styles['em__input']}
                    style={{ fontSize: 16, fontWeight: 700 }}
                    autoFocus
                    {...register('title')}
                  />
                </div>

                <div className={styles['em__field']}>
                  <label className={styles['em__field-label']}>Автор</label>
                  <input className={styles['em__input']} {...register('author')} />
                </div>

                {/* Статус — всегда немедленный, не через форму */}
                <div className={styles['em__status-wrap']}>
                  <button
                    className={styles['em__status-btn']}
                    style={{
                      color: STATUS_TEXT_COLOR[displayStatus],
                      background: `color-mix(in srgb, ${STATUS_TEXT_COLOR[displayStatus]} 12%, transparent)`,
                      borderColor: `color-mix(in srgb, ${STATUS_TEXT_COLOR[displayStatus]} 35%, transparent)`,
                    }}
                    onClick={() => setStatusOpen((v) => !v)}
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>{STATUS_LABEL[displayStatus]}</span>
                    <span className={styles['em__status-btn-dots']}>•••</span>
                  </button>
                  {statusOpen && (
                    <div className={styles['em__status-picker']}>
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={styles['em__status-option']}
                          style={
                            opt.value === displayStatus
                              ? { color: STATUS_TEXT_COLOR[opt.value] }
                              : undefined
                          }
                          onClick={() => handleStatusSelect(opt.value)}
                        >
                          <span
                            className={styles['em__status-dot']}
                            style={{ background: STATUS_TEXT_COLOR[opt.value] }}
                          />
                          {opt.label}
                          {opt.value === displayStatus && (
                            <Check size={13} className={styles['em__status-check']} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {displayStatus === 'DONE' && (
                  <div className={styles['em__field']}>
                    <label className={styles['em__field-label']}>
                      Оценка
                      <span className={styles['em__field-label-val']}>{ratingVal} / 10</span>
                    </label>
                    <input
                      type="range"
                      className={styles['em__range']}
                      min={1}
                      max={10}
                      step={1}
                      {...register('rating', { valueAsNumber: true })}
                    />
                  </div>
                )}

                {(displayStatus === 'READING' || displayStatus === 'DROPPED') &&
                  entry.book.pageCount && (
                    <div className={styles['em__field']}>
                      <label className={styles['em__field-label']}>
                        Прочитано страниц
                        <span className={styles['em__field-label-val']}>
                          {progressVal} / {entry.book.pageCount}
                        </span>
                      </label>
                      <input
                        type="range"
                        className={styles['em__range']}
                        min={0}
                        max={entry.book.pageCount}
                        step={1}
                        {...register('progress', { valueAsNumber: true })}
                      />
                    </div>
                  )}

                <div className={styles['em__field']}>
                  <label className={styles['em__field-label']}>Страниц</label>
                  <input
                    className={styles['em__input']}
                    style={{ width: 120 }}
                    type="number"
                    min={0}
                    {...register('pageCount')}
                  />
                </div>

                <div className={styles['em__field']}>
                  <label className={styles['em__field-label']}>Описание</label>
                  <textarea
                    className={styles['em__textarea']}
                    rows={3}
                    {...register('description')}
                  />
                </div>

                <div className={styles['em__field']}>
                  <label className={styles['em__field-label']}>Заметки</label>
                  <textarea className={styles['em__textarea']} rows={3} {...register('notes')} />
                </div>

                {saveError && <p className={styles['em__error']}>{saveError}</p>}
              </>
            ) : (
              /* ── Режим просмотра ── */
              <>
                <div className={styles['em__head']}>
                  <h2 className={styles['em__book-title']}>{entry.book.title}</h2>
                  <p className={styles['em__book-author']}>{entry.book.author}</p>
                </div>

                <div className={styles['em__status-wrap']}>
                  <button
                    className={styles['em__status-btn']}
                    style={{
                      color: STATUS_TEXT_COLOR[displayStatus],
                      background: `color-mix(in srgb, ${STATUS_TEXT_COLOR[displayStatus]} 12%, transparent)`,
                      borderColor: `color-mix(in srgb, ${STATUS_TEXT_COLOR[displayStatus]} 35%, transparent)`,
                    }}
                    onClick={() => setStatusOpen((v) => !v)}
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>{STATUS_LABEL[displayStatus]}</span>
                    <span className={styles['em__status-btn-dots']}>•••</span>
                  </button>
                  {statusOpen && (
                    <div className={styles['em__status-picker']}>
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={styles['em__status-option']}
                          style={
                            opt.value === displayStatus
                              ? { color: STATUS_TEXT_COLOR[opt.value] }
                              : undefined
                          }
                          onClick={() => handleStatusSelect(opt.value)}
                        >
                          <span
                            className={styles['em__status-dot']}
                            style={{ background: STATUS_TEXT_COLOR[opt.value] }}
                          />
                          {opt.label}
                          {opt.value === displayStatus && (
                            <Check size={13} className={styles['em__status-check']} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {entry.status === 'DONE' && (
                  <div className={styles['em__field']}>
                    <label className={styles['em__field-label']}>Оценка</label>
                    <div className={styles['em__meta-value']} style={{ padding: '2px 0' }}>
                      {entry.rating !== null ? (
                        <span
                          style={entry.rating ? { color: scoreColor(entry.rating) } : undefined}
                        >
                          {entry.rating === 10 ? (
                            <Star
                              size={14}
                              fill={GOLD_COLOR}
                              stroke="none"
                              style={{ verticalAlign: 'middle' }}
                            />
                          ) : (
                            `${entry.rating} / 10`
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                )}

                {(entry.status === 'READING' || entry.status === 'DROPPED') &&
                  entry.book.pageCount && (
                    <div className={styles['em__field']}>
                      <label className={styles['em__field-label']}>Прочитано страниц</label>
                      <div className={styles['em__progress']}>
                        {progressPct !== null && (
                          <>
                            <div className={styles['em__progress-row']}>
                              <span>Прогресс</span>
                              <span className={styles['em__progress-pct']}>{progressPct}%</span>
                            </div>
                            <div className={styles['em__progress-track']}>
                              <span
                                className={styles['em__progress-fill']}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </>
                        )}
                        <span className={styles['em__progress-pages']}>
                          {entry.progress ?? 0} / {entry.book.pageCount} стр.
                        </span>
                      </div>
                    </div>
                  )}

                {entry.status === 'DROPPED' && entry.progress !== null && !entry.book.pageCount && (
                  <div className={styles['em__meta']}>
                    <span className={styles['em__meta-label']}>Дочитано до</span>
                    <span className={styles['em__meta-value']}>{entry.progress} стр.</span>
                  </div>
                )}

                <div className={styles['em__divider']} />

                <div className={styles['em__meta']}>
                  <span className={styles['em__meta-label']}>Страниц</span>
                  <span className={styles['em__meta-value']}>{entry.book.pageCount ?? '—'}</span>
                </div>

                <div className={styles['em__divider']} />

                <div>
                  <span className={styles['em__section-label']}>Описание</span>
                  {entry.book.description ? (
                    <p className={styles['em__description']}>{entry.book.description}</p>
                  ) : (
                    <p className={styles['em__placeholder']}>Нет описания</p>
                  )}
                </div>

                <div className={styles['em__divider']} />

                <div>
                  <span className={styles['em__section-label']}>Заметки</span>
                  {entry.notes ? (
                    <p className={styles['em__notes-text']}>{entry.notes}</p>
                  ) : (
                    <p className={styles['em__placeholder']}>Нет заметок</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Футер ── */}
        {isEditing ? (
          <div className={`${styles['em__footer']} ${styles['em__footer--create']}`}>
            <button
              className={`${styles['em__btn']} ${styles['em__btn--cancel']}`}
              onClick={handleCancelEdit}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              className={`${styles['em__btn']} ${styles['em__btn--save']}`}
              onClick={() => void onEditSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        ) : (
          <div className={styles['em__footer']}>
            <div className={styles['em__footer-actions']}>
              <button
                className={`${styles['em__btn']} ${styles['em__btn--delete']} ${
                  isMobile ? styles['em__btn--icon'] : ''
                }`}
                onClick={handleDeleteClick}
              >
                <Trash2 size={isMobile ? 18 : 14} />
                {!isMobile && 'Удалить'}
              </button>
              <span className={styles['em__date']}>Добавлено {formatDate(entry.createdAt)}</span>
            </div>
            <button
              className={`${styles['em__edit-btn']} ${isMobile ? styles['em__edit-btn--icon'] : ''}`}
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={isMobile ? 18 : 14} />
              {!isMobile && 'Редактировать'}
            </button>
          </div>
        )}
      </motion.div>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Удалить запись?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Книга «{entry.book.title}» будет удалена из библиотеки. Это действие нельзя отменить.
          </DialogContentText>
          {deleteError && (
            <DialogContentText color="error" sx={{ mt: 1 }}>
              {deleteError}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleDeleteDialogClose} disabled={isDeleting}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteConfirmed()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление…' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  )
}
