import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { STATUS_OPTIONS, STATUS_TEXT_COLOR } from '../../model/book.types'
import type { BookStatus } from '../../model/book.types'
import type { CreateBookPayload } from './BookExpandModal.types'
import styles from './BookExpandModal.module.scss'

/**
 * Значения формы создания книги.
 */
interface CreateFormValues {
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** Количество страниц (строка, конвертируется при отправке). */
  pageCount: string
  /** Описание книги. */
  description: string
  /** Статус чтения. */
  status: BookStatus
  /** Оценка (1–10). */
  rating: number
  /** Прочитано страниц. */
  progress: number
  /** Заметки пользователя. */
  notes: string
}

/**
 * Пропсы BookCreateForm.
 */
interface BookCreateFormProps {
  /** Флаг адаптации под мобильный экран. */
  isMobile: boolean
  /** Функция создания книги; закрывает модалку при успехе. */
  onCreate: (payload: CreateBookPayload) => Promise<void>
  /** Функция закрытия модалки. */
  onClose: () => void
}

/**
 * Модальная форма создания новой книги.
 */
export const BookCreateForm = ({ isMobile, onCreate, onClose }: BookCreateFormProps) => {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<CreateFormValues>({
    defaultValues: {
      title: '',
      author: '',
      pageCount: '',
      description: '',
      status: 'WANT',
      rating: 5,
      progress: 0,
      notes: '',
    },
  })

  const [statusVal, ratingVal, pageCountStr, titleVal, progressVal] = useWatch({
    control,
    name: ['status', 'rating', 'pageCount', 'title', 'progress'],
  })
  const hasPageCount = !!(pageCountStr && Number(pageCountStr) > 0)
  const showProgress = (statusVal === 'READING' || statusVal === 'DROPPED') && hasPageCount

  const onSubmit = handleSubmit(async (values) => {
    const hasPageCountVal = !!(values.pageCount && Number(values.pageCount) > 0)
    const payload: CreateBookPayload = {
      title: values.title.trim(),
      author: values.author.trim() || 'Автор неизвестен',
      ...(hasPageCountVal && { pageCount: Number(values.pageCount) }),
      ...(values.description.trim() && { description: values.description.trim() }),
      status: values.status,
      ...(values.status === 'DONE' && values.rating && { rating: values.rating }),
      ...((values.status === 'READING' || values.status === 'DROPPED') &&
        hasPageCountVal &&
        values.progress && { progress: values.progress }),
      ...(values.notes.trim() && { notes: values.notes.trim() }),
    }
    setError(null)
    try {
      await onCreate(payload)
    } catch {
      setError('Не удалось добавить книгу. Попробуй ещё раз.')
    }
  })

  return (
    <motion.div
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
                autoFocus
                placeholder="Введите название"
                {...register('title')}
              />
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>Автор</label>
              <input
                className={styles['em__input']}
                placeholder="Автор книги"
                {...register('author')}
              />
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>Статус</label>
              <div className={styles['em__chips']}>
                {STATUS_OPTIONS.map((opt) => {
                  const active = statusVal === opt.value
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
                      onClick={() => setValue('status', opt.value)}
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
                placeholder="0"
                {...register('pageCount')}
              />
            </div>

            {statusVal === 'DONE' && (
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

            {showProgress && (
              <div className={styles['em__field']}>
                <label className={styles['em__field-label']}>
                  Прочитано страниц
                  <span className={styles['em__field-label-val']}>
                    {progressVal} / {pageCountStr}
                  </span>
                </label>
                <input
                  type="range"
                  className={styles['em__range']}
                  min={0}
                  max={Number(pageCountStr)}
                  step={1}
                  {...register('progress', { valueAsNumber: true })}
                />
              </div>
            )}

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>Описание</label>
              <textarea className={styles['em__textarea']} rows={3} {...register('description')} />
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>Заметки</label>
              <textarea className={styles['em__textarea']} rows={3} {...register('notes')} />
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
            onClick={() => void onSubmit()}
            disabled={isSubmitting || !titleVal.trim()}
          >
            {isSubmitting ? 'Создание…' : 'Создать'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
