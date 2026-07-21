import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { STATUS_OPTIONS, STATUS_TEXT_COLOR } from '../../model/book.types'
import type { CreateBookPayload } from './BookExpandModal.types'
import { createBookSchema } from './bookFormSchemas'
import type { CreateFormValues } from './bookFormSchemas'
import styles from './BookExpandModal.module.scss'

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
  /** Сообщает родителю о наличии несохранённых изменений в форме. */
  onDirtyChange: (dirty: boolean) => void
}

/**
 * Модальная форма создания новой книги.
 */
export const BookCreateForm = ({
  isMobile,
  onCreate,
  onClose,
  onDirtyChange,
}: BookCreateFormProps) => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createBookSchema(t)),
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

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  const onSubmit = handleSubmit(async (values) => {
    const hasPageCountVal = !!(values.pageCount && Number(values.pageCount) > 0)
    const payload: CreateBookPayload = {
      title: values.title.trim(),
      author: values.author.trim(),
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
      setSubmitted(true)
    } catch {
      setError(t('book.modal.createError'))
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
        <span className={styles['em__mode-label']}>{t('book.modal.creating')}</span>
      </div>

      <div className={styles['em__content']}>
        <div className={styles['em__scroll']}>
          <div className={styles['em__body']}>
            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>{t('book.fields.titleRequired')}</label>
              <input
                className={styles['em__input']}
                autoFocus
                placeholder={t('book.modal.titlePlaceholder')}
                {...register('title')}
              />
              {errors.title && <p className={styles['em__error']}>{errors.title.message}</p>}
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>{t('book.fields.author')}</label>
              <input
                className={styles['em__input']}
                placeholder={t('book.modal.authorPlaceholder')}
                {...register('author')}
              />
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>{t('book.fields.status')}</label>
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
                      {t(`book.status.${opt.value}`)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>{t('book.fields.pages')}</label>
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
                  {t('book.fields.rating')}
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
                  {t('book.fields.pagesRead')}
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
              <label className={styles['em__field-label']}>{t('book.fields.description')}</label>
              <textarea className={styles['em__textarea']} rows={3} {...register('description')} />
            </div>

            <div className={styles['em__field']}>
              <label className={styles['em__field-label']}>{t('book.fields.notes')}</label>
              <textarea className={styles['em__textarea']} rows={3} {...register('notes')} />
            </div>

            {error && <p className={styles['em__error']}>{error}</p>}
          </div>
        </div>

        <div className={`${styles['em__footer']} ${styles['em__footer--create']}`}>
          <button
            className={`${styles['em__btn']} ${styles['em__btn--cancel']}`}
            onClick={onClose}
            disabled={isSubmitting || submitted}
          >
            {t('book.modal.cancel')}
          </button>
          <button
            className={`${styles['em__btn']} ${styles['em__btn--save']}`}
            onClick={() => void onSubmit()}
            disabled={isSubmitting || submitted || !titleVal.trim()}
          >
            {isSubmitting ? t('book.modal.creatingAction') : t('book.modal.create')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
