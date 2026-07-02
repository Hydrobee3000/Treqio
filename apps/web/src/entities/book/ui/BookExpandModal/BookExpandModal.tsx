import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Star, Trash2, X } from 'lucide-react'
import { useMediaQuery, useTheme } from '@mui/material'
import { STATUS_LABEL } from '../../model/book.types'
import type { BookEntry, BookStatus } from '../../model/book.types'
import styles from './BookExpandModal.module.scss'

const STATUS_TEXT_COLOR: Record<BookStatus, string> = {
  WANT: '#9c8a6a',
  READING: '#4a92bd',
  DONE: '#3d8a5c',
  DROPPED: '#b94040',
}

function scoreColor(rating: number): string {
  if (rating >= 8) return '#5e9b84'
  if (rating >= 6) return '#c49a3a'
  return '#b94040'
}

const GOLD_COLOR = '#ffd24a'

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = Object.entries(STATUS_LABEL).map(
  ([value, label]) => ({ value: value as BookStatus, label }),
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export interface BookFieldUpdate {
  title?: string
  author?: string
  pageCount?: number
  description?: string
}

export interface EntryFieldUpdate {
  status?: BookStatus
  rating?: number
  progress?: number
  notes?: string
}

interface BookExpandModalProps {
  entry: BookEntry | null
  onClose: () => void
  onSaveBook?: (dto: BookFieldUpdate) => Promise<void>
  onSaveEntry?: (dto: EntryFieldUpdate) => Promise<void>
  onDelete?: () => Promise<void>
  onStatusChange?: (status: BookStatus) => void
}

export const BookExpandModal = ({
  entry,
  onClose,
  onSaveBook,
  onSaveEntry,
  onDelete,
  onStatusChange,
}: BookExpandModalProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const closingRef = useRef(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldDraft, setFieldDraft] = useState('')
  const [ratingDraft, setRatingDraft] = useState(0)
  const [progressDraft, setProgressDraft] = useState(0)
  const [localStatus, setLocalStatus] = useState<BookStatus | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    closingRef.current = false
    if (entry) {
      setRatingDraft(entry.rating ?? 5)
      setProgressDraft(entry.progress ?? 0)
      setLocalStatus(null)
    }
    setEditingField(null)
    setFieldDraft('')
    setError(null)
    setDeleteConfirm(false)
    setStatusOpen(false)
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

  return (
    <AnimatePresence>
      {entry && (
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
            onClose()
          }}
        >
          <div
            className={`${styles['em__centering']} ${isMobile ? styles['em__centering--mobile'] : ''}`}
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              key={`em-${entry.id}`}
              layoutId={`book-cover-${entry.id}`}
              className={`${styles['em__modal']} ${isMobile ? styles['em__modal--mobile'] : ''}`}
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            >
              <div className={styles['em__hero']}>
                <button
                  className={styles['em__close']}
                  onMouseDown={() => {
                    closingRef.current = true
                  }}
                  onClick={() => {
                    closingRef.current = false
                    onClose()
                  }}
                >
                  <X size={15} />
                </button>
                {entry.status === 'DONE' && entry.rating !== null && (
                  <div className={styles['em__score']}>
                    <svg viewBox="0 0 42 42" className={styles['em__score-svg']}>
                      <circle
                        cx="21"
                        cy="21"
                        r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="18"
                        fill="none"
                        stroke={entry.rating === 10 ? GOLD_COLOR : scoreColor(entry.rating)}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - entry.rating / 10)}
                      />
                    </svg>
                    <div className={styles['em__score-value']}>
                      {entry.rating === 10 ? (
                        <Star size={13} fill={GOLD_COLOR} stroke="none" />
                      ) : (
                        <span>{entry.rating}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <motion.div
                className={styles['em__content']}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.22 } }}
              >
                <div className={styles['em__scroll']}>
                  <div className={styles['em__body']}>
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
                              style={entry.rating ? { color: scoreColor(entry.rating) } : undefined}
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

                    {entry.status === 'DROPPED' &&
                      entry.progress !== null &&
                      !entry.book.pageCount && (
                        <div className={styles['em__meta']}>
                          <span className={styles['em__meta-label']}>Дочитано до</span>
                          <span className={styles['em__meta-value']}>{entry.progress} стр.</span>
                        </div>
                      )}

                    <div className={styles['em__divider']} />

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
                            void commitBookField('pageCount', String(entry.book.pageCount ?? ''))
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
                          onClick={() => startEdit('pageCount', String(entry.book.pageCount ?? ''))}
                        >
                          {entry.book.pageCount ?? '—'}
                        </span>
                      )}
                    </div>

                    <div className={styles['em__divider']} />

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
                          onKeyDown={(e) => handleTextareaKeyDown(e, entry.book.description ?? '')}
                        />
                      ) : (
                        <div
                          className={styles['em__editable']}
                          onClick={() => startEdit('description', entry.book.description ?? '')}
                        >
                          {entry.book.description ? (
                            <p className={styles['em__description']}>{entry.book.description}</p>
                          ) : (
                            <p className={styles['em__placeholder']}>Нет описания</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles['em__divider']} />

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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
