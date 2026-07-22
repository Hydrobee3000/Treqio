import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@mui/material'
import { X } from 'lucide-react'
import styles from './ConfirmCard.module.scss'

/**
 * Свойства ConfirmCard.
 */
interface Props {
  /** Флаг видимости карточки. */
  open: boolean
  /** Заголовок в градиентной шапке. */
  title: string
  /** Текст описания. */
  description: string
  /** Текст кнопки отмены. */
  cancelLabel: string
  /** Текст кнопки подтверждения. */
  confirmLabel: string
  /** Иконка кнопки подтверждения. */
  confirmIcon?: ReactNode
  /** Цветовой вариант кнопки подтверждения — error для разрушительных действий. */
  confirmColor?: 'primary' | 'error'
  /** Блокирует кнопки и закрытие (например во время запроса на сервер). */
  disabled?: boolean
  /** Текст ошибки под описанием — например при неудачном подтверждении. */
  error?: string | undefined
  /** Колбэк закрытия без подтверждения (крестик, фон, Escape, кнопка отмены). */
  onCancel: () => void
  /** Колбэк подтверждения действия. */
  onConfirm: () => void
}

/**
 * Модальное окно-карточка подтверждения действия —  с затемнением фона, заголовком, описанием и кнопками.
 * Используется для подтверждения разрушительных действий (удаление, сброс, выход без сохранения).
 */
export const ConfirmCard = ({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmIcon,
  confirmColor = 'primary',
  disabled = false,
  error,
  onCancel,
  onConfirm,
}: Props) => {
  const handleCancel = () => {
    if (!disabled) onCancel()
  }

  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, disabled, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="confirm-card-backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCancel}
          />
          <div className={styles.centering}>
            <motion.div
              key="confirm-card"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            >
              <div
                className={`${styles.hero} ${confirmColor === 'error' ? styles['hero--error'] : ''}`}
              >
                <button
                  className={styles['hero__close']}
                  onClick={handleCancel}
                  disabled={disabled}
                  aria-label="close"
                >
                  <X size={15} />
                </button>
                <h2 className={styles['hero__title']}>{title}</h2>
              </div>
              <div className={styles.content}>
                <p className={styles.description}>{description}</p>
                {error && <p className={styles['content__error']}>{error}</p>}
              </div>
              <div className={styles.footer}>
                <Button
                  variant="outlined"
                  size="small"
                  className={styles['footer__btn-cancel']}
                  onClick={handleCancel}
                  disabled={disabled}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant="contained"
                  color={confirmColor}
                  size="small"
                  className={
                    confirmColor === 'error'
                      ? styles['footer__btn-confirm--error']
                      : styles['footer__btn-confirm']
                  }
                  startIcon={confirmIcon}
                  onClick={onConfirm}
                  disabled={disabled}
                >
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
