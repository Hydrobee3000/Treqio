import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Star, Trash2, X } from 'lucide-react'
import { useMediaQuery, useTheme } from '@mui/material'
import {
  STATUS_LABEL,
  STATUS_TEXT_COLOR,
  STATUS_OPTIONS,
  GOLD_COLOR,
  scoreColor,
} from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import { ScoreBadge } from '../ScoreBadge/ScoreBadge'
import styles from './BookExpandModal.module.scss'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Поля книги (book), обновляемые по одному.
 */
export interface BookFieldUpdate {
  title?: string
  author?: string
  pageCount?: number
  description?: string
}

/**
 * Поля записи пользователя (entry), обновляемые по одному.
 */
export interface EntryFieldUpdate {
  status?: BookStatus
  rating?: number
  progress?: number
  notes?: string
}

/**
 * Данные для создания новой книги и записи.
 */
export interface CreateBookPayload {
  title: string
  author: string
  pageCount?: number
  description?: string
  status: BookStatus
  rating?: number
  progress?: number
  notes?: string
}

interface CreateDraft {
  title: string
  author: string
  pageCount: string
  description: string
  status: BookStatus
  rating: string
  progress: string
  notes: string
}

const DEFAULT_CREATE: CreateDraft = {
  title: '',
  author: '',
  pageCount: '',
  description: '',
  status: 'WANT',
  rating: '',
  progress: '',
  notes: '',
}

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
  /** Сохранение поля книги при потере фокуса. */
  onSaveBook?: (dto: BookFieldUpdate) => Promise<void>
  /** Сохранение поля записи при потере фокуса. */
  onSaveEntry?: (dto: EntryFieldUpdate) => Promise<void>
  /** Создание новой книги. */
  onCreate?: (payload: CreateBookPayload) => Promise<void>
  /** Удаление записи. */
  onDelete?: () => Promise<void>
  /** Быстрая смена статуса без перехода в поле. */
  onStatusChange?: (status: BookStatus) => void
}

/**
 * Модальное окно книги — просмотр, инлайн-редактирование полей и создание новой записи.
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

  const closingRef = useRef(false)
  // Предотвращает закрытие до завершения открывающей layout-анимации (shared element).
  // Если пользователь закрывает раньше — вызов откладывается до onLayoutAnimationComplete.
  const openAnimationCompleteRef = useRef(false)
  const pendingCloseRef = useRef(false)

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

  const startEdit = (field: string, value: string) => {
    setEditingField(field)
    setFieldDraft(value)
    setStatusOpen(false)
    setError(null)
  }

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    onEnter: () => void,
    originalValue: string,
  ) => {
    if (e.key === 'Enter') onEnter()
    else if (e.key === 'Escape') {
      setFieldDraft(originalValue)
      setEditingField(null)
    }
  }

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    originalValue: string,
  ) => {
    if (e.key === 'Escape') {
      setFieldDraft(originalValue)
      setEditingField(null)
    }
  }

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

  const handleStatusSelect = (status: BookStatus) => {
    setStatusOpen(false)
    setLocalStatus(status)
    onStatusChange?.(status)
  }

  // ── Удаление ────────────────────────────────────────────────────────────────

  const handleDeleteClick = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    void handleDeleteConfirmed()
  }

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

  const showCreate = !entry && creating
  const hasCreatePageCount = !!(createDraft.pageCount && Number(createDraft.pageCount) > 0)
  const showCreateProgress =
    (createDraft.status === 'READING' || createDraft.status === 'DROPPED') && hasCreatePageCount
  const createRatingVal = createDraft.rating ? Number(createDraft.rating) : 0

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
          onMouseDown={() => {
            closingRef.current = true
          }}
          onClick={() => {
            closingRef.current = false
            triggerClose()
          }}
        >
          <div
            className={`${styles['em__centering']} ${isMobile ? styles['em__centering--mobile'] : ''}`}
            style={{ pointerEvents: 'none' }}
          >
            <AnimatePresence>
              {/* ── Существующая запись ── */}
              {entry && (
                <motion.div
                  key={`em-${entry.id}`}
                  layoutId={`book-cover-${entry.id}`}
                  className={`${styles['em__modal']} ${isMobile ? styles['em__modal--mobile'] : ''}`}
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
                  transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                  onLayoutAnimationComplete={() => {
                    openAnimationCompleteRef.current = true
                    if (pendingCloseRef.current) {
                      pendingCloseRef.current = false
                      onClose()
                    }
                  }}
                >
                  <div className={styles['em__hero']}>
                    <button
                      className={styles['em__close']}
                      onMouseDown={() => {
                        closingRef.current = true
                      }}
                      onClick={() => {
                        closingRef.current = false
                        triggerClose()
                      }}
                    >
                      <X size={15} />
                    </button>
                    {entry.status === 'DONE' && entry.rating !== null && (
                      <ScoreBadge rating={entry.rating} size="md" className={styles['em__score']} />
                    )}
                  </div>

                  <motion.div
                    className={styles['em__content']}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.22 } }}
                  >
                    <div className={styles['em__scroll']}>
                      <div className={styles['em__body']}>
                        {/* Название и автор */}
                        <div className={styles['em__head']}>
                          {editingField === 'title' ? (
                            <input
                              className={styles['em__input']}
                              style={{ fontSize: 18, fontWeight: 700 }}
                              value={fieldDraft}
                              autoFocus
                              onChange={(e) => setFieldDraft(e.target.value)}
                              onBlur={() => void commitBookField('title', entry.book.title)}
                              onKeyDown={(e) =>
                                handleInputKeyDown(
                                  e,
                                  () => void commitBookField('title', entry.book.title),
                                  entry.book.title,
                                )
                              }
                            />
                          ) : (
                            <h2
                              className={`${styles['em__book-title']} ${styles['em__editable']}`}
                              onClick={() => startEdit('title', entry.book.title)}
                            >
                              {entry.book.title}
                            </h2>
                          )}

                          {editingField === 'author' ? (
                            <input
                              className={styles['em__input']}
                              value={fieldDraft}
                              autoFocus
                              onChange={(e) => setFieldDraft(e.target.value)}
                              onBlur={() => void commitBookField('author', entry.book.author)}
                              onKeyDown={(e) =>
                                handleInputKeyDown(
                                  e,
                                  () => void commitBookField('author', entry.book.author),
                                  entry.book.author,
                                )
                              }
                            />
                          ) : (
                            <p
                              className={`${styles['em__book-author']} ${styles['em__editable']}`}
                              onClick={() => startEdit('author', entry.book.author)}
                            >
                              {entry.book.author}
                            </p>
                          )}
                        </div>

                        {/* Статус */}
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

                        {/* Оценка (Прочитано) */}
                        {entry.status === 'DONE' && (
                          <div className={styles['em__field']}>
                            <label className={styles['em__field-label']}>
                              Оценка
                              {editingField === 'rating' && (
                                <span className={styles['em__field-label-val']}>
                                  {ratingDraft || '—'} / 10
                                </span>
                              )}
                            </label>
                            {editingField === 'rating' ? (
                              <input
                                type="range"
                                className={styles['em__range']}
                                min={1}
                                max={10}
                                step={1}
                                value={ratingDraft || 5}
                                autoFocus
                                onChange={(e) => setRatingDraft(Number(e.target.value))}
                                onBlur={() => void commitRating()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    setRatingDraft(entry.rating ?? 0)
                                    setEditingField(null)
                                  }
                                }}
                              />
                            ) : (
                              <div
                                className={`${styles['em__editable']} ${styles['em__editable--pointer']}`}
                                onClick={() => {
                                  setRatingDraft(entry.rating ?? 5)
                                  startEdit('rating', String(entry.rating ?? ''))
                                }}
                              >
                                <span
                                  className={styles['em__meta-value']}
                                  style={
                                    entry.rating ? { color: scoreColor(entry.rating) } : undefined
                                  }
                                >
                                  {entry.rating !== null ? (
                                    entry.rating === 10 ? (
                                      <Star
                                        size={14}
                                        fill={GOLD_COLOR}
                                        stroke="none"
                                        style={{ verticalAlign: 'middle' }}
                                      />
                                    ) : (
                                      `${entry.rating} / 10`
                                    )
                                  ) : (
                                    '—'
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Прогресс (Читаю / Брошено с pageCount) */}
                        {(entry.status === 'READING' || entry.status === 'DROPPED') &&
                          entry.book.pageCount && (
                            <div className={styles['em__field']}>
                              <label className={styles['em__field-label']}>
                                Прочитано страниц
                                {editingField === 'progress' && (
                                  <span className={styles['em__field-label-val']}>
                                    {progressDraft} / {entry.book.pageCount}
                                  </span>
                                )}
                              </label>
                              {editingField === 'progress' ? (
                                <input
                                  type="range"
                                  className={styles['em__range']}
                                  min={0}
                                  max={entry.book.pageCount}
                                  step={1}
                                  value={progressDraft}
                                  autoFocus
                                  onChange={(e) => setProgressDraft(Number(e.target.value))}
                                  onBlur={() => void commitProgress()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setProgressDraft(entry.progress ?? 0)
                                      setEditingField(null)
                                    }
                                  }}
                                />
                              ) : (
                                <div
                                  className={`${styles['em__progress']} ${styles['em__editable']} ${styles['em__editable--pointer']}`}
                                  onClick={() => {
                                    setProgressDraft(entry.progress ?? 0)
                                    startEdit('progress', String(entry.progress ?? ''))
                                  }}
                                >
                                  {progressPct !== null && (
                                    <>
                                      <div className={styles['em__progress-row']}>
                                        <span>Прогресс</span>
                                        <span className={styles['em__progress-pct']}>
                                          {progressPct}%
                                        </span>
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
                              )}
                            </div>
                          )}

                        {/* Брошено без pageCount */}
                        {entry.status === 'DROPPED' &&
                          entry.progress !== null &&
                          !entry.book.pageCount && (
                            <div className={styles['em__meta']}>
                              <span className={styles['em__meta-label']}>Дочитано до</span>
                              <span className={styles['em__meta-value']}>
                                {entry.progress} стр.
                              </span>
                            </div>
                          )}

                        <div className={styles['em__divider']} />

                        {/* Страниц */}
                        <div className={styles['em__meta']}>
                          <span className={styles['em__meta-label']}>Страниц</span>
                          {editingField === 'pageCount' ? (
                            <input
                              className={styles['em__input']}
                              style={{ width: 100 }}
                              type="number"
                              min={0}
                              value={fieldDraft}
                              autoFocus
                              onChange={(e) => setFieldDraft(e.target.value)}
                              onBlur={() =>
                                void commitBookField(
                                  'pageCount',
                                  String(entry.book.pageCount ?? ''),
                                )
                              }
                              onKeyDown={(e) =>
                                handleInputKeyDown(
                                  e,
                                  () =>
                                    void commitBookField(
                                      'pageCount',
                                      String(entry.book.pageCount ?? ''),
                                    ),
                                  String(entry.book.pageCount ?? ''),
                                )
                              }
                            />
                          ) : (
                            <span
                              className={`${styles['em__meta-value']} ${styles['em__editable']}`}
                              onClick={() =>
                                startEdit('pageCount', String(entry.book.pageCount ?? ''))
                              }
                            >
                              {entry.book.pageCount ?? '—'}
                            </span>
                          )}
                        </div>

                        <div className={styles['em__divider']} />

                        {/* Описание */}
                        <div>
                          <span className={styles['em__section-label']}>Описание</span>
                          {editingField === 'description' ? (
                            <textarea
                              className={styles['em__textarea']}
                              value={fieldDraft}
                              rows={3}
                              autoFocus
                              onChange={(e) => setFieldDraft(e.target.value)}
                              onBlur={() =>
                                void commitBookField('description', entry.book.description ?? '')
                              }
                              onKeyDown={(e) =>
                                handleTextareaKeyDown(e, entry.book.description ?? '')
                              }
                            />
                          ) : (
                            <div
                              className={styles['em__editable']}
                              onClick={() => startEdit('description', entry.book.description ?? '')}
                            >
                              {entry.book.description ? (
                                <p className={styles['em__description']}>
                                  {entry.book.description}
                                </p>
                              ) : (
                                <p className={styles['em__placeholder']}>Нет описания</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={styles['em__divider']} />

                        {/* Заметки */}
                        <div>
                          <span className={styles['em__section-label']}>Заметки</span>
                          {editingField === 'notes' ? (
                            <textarea
                              className={styles['em__textarea']}
                              value={fieldDraft}
                              rows={3}
                              autoFocus
                              onChange={(e) => setFieldDraft(e.target.value)}
                              onBlur={() => void commitNotes(entry.notes ?? '')}
                              onKeyDown={(e) => handleTextareaKeyDown(e, entry.notes ?? '')}
                            />
                          ) : (
                            <div
                              className={styles['em__editable']}
                              onClick={() => startEdit('notes', entry.notes ?? '')}
                            >
                              {entry.notes ? (
                                <p className={styles['em__notes-text']}>{entry.notes}</p>
                              ) : (
                                <p className={styles['em__placeholder']}>Нет заметок</p>
                              )}
                            </div>
                          )}
                        </div>

                        {error && <p className={styles['em__error']}>{error}</p>}
                      </div>
                    </div>

                    <div className={styles['em__footer']}>
                      <button
                        className={`${styles['em__btn']} ${styles['em__btn--delete']} ${
                          deleteConfirm ? styles['em__btn--delete-confirm'] : ''
                        }`}
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                      >
                        <Trash2 size={14} />
                        {isDeleting ? 'Удаление…' : deleteConfirm ? 'Точно?' : 'Удалить'}
                      </button>
                      {deleteConfirm ? (
                        <button
                          className={`${styles['em__btn']} ${styles['em__btn--cancel']}`}
                          onClick={() => setDeleteConfirm(false)}
                        >
                          Отмена
                        </button>
                      ) : (
                        <span className={styles['em__date']}>
                          Добавлено {formatDate(entry.createdAt)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── Создание книги ── */}
              {showCreate && (
                <motion.div
                  key="em-create"
                  className={`${styles['em__modal']} ${isMobile ? styles['em__modal--mobile'] : ''}`}
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18, ease: 'easeIn' } }}
                  transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                >
                  <div className={styles['em__hero']}>
                    <button className={styles['em__close']} onClick={onClose}>
                      <X size={15} />
                    </button>
                  </div>

                  <div className={styles['em__content']}>
                    <div className={styles['em__scroll']}>
                      <div className={styles['em__body']}>
                        <div className={styles['em__field']}>
                          <label className={styles['em__field-label']}>Название *</label>
                          <input
                            className={styles['em__input']}
                            value={createDraft.title}
                            autoFocus
                            placeholder="Введи название"
                            onChange={(e) =>
                              setCreateDraft((d) => ({ ...d, title: e.target.value }))
                            }
                          />
                        </div>

                        <div className={styles['em__field']}>
                          <label className={styles['em__field-label']}>Автор</label>
                          <input
                            className={styles['em__input']}
                            value={createDraft.author}
                            placeholder="Автор книги"
                            onChange={(e) =>
                              setCreateDraft((d) => ({ ...d, author: e.target.value }))
                            }
                          />
                        </div>

                        <div className={styles['em__field']}>
                          <label className={styles['em__field-label']}>Статус</label>
                          <div className={styles['em__chips']}>
                            {STATUS_OPTIONS.map((opt) => {
                              const active = createDraft.status === opt.value
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  className={`${styles['em__chip']} ${active ? styles['em__chip--active'] : ''}`}
                                  style={
                                    active
                                      ? {
                                          color: STATUS_TEXT_COLOR[opt.value],
                                          borderColor: STATUS_TEXT_COLOR[opt.value],
                                          background: `color-mix(in srgb, ${STATUS_TEXT_COLOR[opt.value]} 14%, transparent)`,
                                        }
                                      : undefined
                                  }
                                  onClick={() =>
                                    setCreateDraft((d) => ({
                                      ...d,
                                      status: opt.value,
                                      rating: opt.value !== 'DONE' ? '' : d.rating,
                                      progress:
                                        opt.value === 'READING' || opt.value === 'DROPPED'
                                          ? d.progress
                                          : '',
                                    }))
                                  }
                                >
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className={styles['em__field']}>
                          <label className={styles['em__field-label']}>Страниц</label>
                          <input
                            className={styles['em__input']}
                            style={{ width: 120 }}
                            type="number"
                            min={0}
                            value={createDraft.pageCount}
                            placeholder="0"
                            onChange={(e) =>
                              setCreateDraft((d) => ({ ...d, pageCount: e.target.value }))
                            }
                          />
                        </div>

                        {createDraft.status === 'DONE' && (
                          <div className={styles['em__field']}>
                            <label className={styles['em__field-label']}>
                              Оценка
                              <span className={styles['em__field-label-val']}>
                                {createRatingVal ? `${createRatingVal} / 10` : '—'}
                              </span>
                            </label>
                            <input
                              type="range"
                              className={styles['em__range']}
                              min={1}
                              max={10}
                              step={1}
                              value={createRatingVal || 5}
                              onChange={(e) =>
                                setCreateDraft((d) => ({ ...d, rating: e.target.value }))
                              }
                            />
                          </div>
                        )}

                        {showCreateProgress && (
                          <div className={styles['em__field']}>
                            <label className={styles['em__field-label']}>
                              Прочитано страниц
                              <span className={styles['em__field-label-val']}>
                                {createDraft.progress || 0} / {createDraft.pageCount}
                              </span>
                            </label>
                            <input
                              type="range"
                              className={styles['em__range']}
                              min={0}
                              max={Number(createDraft.pageCount)}
                              step={1}
                              value={createDraft.progress ? Number(createDraft.progress) : 0}
                              onChange={(e) =>
                                setCreateDraft((d) => ({ ...d, progress: e.target.value }))
                              }
                            />
                          </div>
                        )}

                        <div className={styles['em__field']}>
                          <label className={styles['em__field-label']}>Описание</label>
                          <textarea
                            className={styles['em__textarea']}
                            value={createDraft.description}
                            rows={3}
                            onChange={(e) =>
                              setCreateDraft((d) => ({ ...d, description: e.target.value }))
                            }
                          />
                        </div>

                        <div className={styles['em__field']}>
                          <label className={styles['em__field-label']}>Заметки</label>
                          <textarea
                            className={styles['em__textarea']}
                            value={createDraft.notes}
                            rows={3}
                            onChange={(e) =>
                              setCreateDraft((d) => ({ ...d, notes: e.target.value }))
                            }
                          />
                        </div>

                        {error && <p className={styles['em__error']}>{error}</p>}
                      </div>
                    </div>

                    <div className={`${styles['em__footer']} ${styles['em__footer--create']}`}>
                      <button
                        className={`${styles['em__btn']} ${styles['em__btn--cancel']}`}
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Отмена
                      </button>
                      <button
                        className={`${styles['em__btn']} ${styles['em__btn--save']}`}
                        onClick={() => void handleCreate()}
                        disabled={isSubmitting || !createDraft.title.trim()}
                      >
                        {isSubmitting ? 'Создание…' : 'Создать'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
