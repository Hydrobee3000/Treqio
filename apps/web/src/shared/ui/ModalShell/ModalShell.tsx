import { useEffect } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useBackdropClose } from '@/shared/lib/hooks/useBackdropClose'
import styles from './ModalShell.module.scss'

/**
 * Свойства ModalShell.
 */
interface Props {
  /** Флаг видимости модалки. */
  open: boolean
  /** Заголовок в градиентной шапке. */
  title: string
  /** Иконка рядом с заголовком. */
  icon?: ReactNode
  /** Цветовой вариант шапки — error для разрушительных действий. */
  variant?: 'primary' | 'error'
  /** Блокирует кнопку закрытия, backdrop и Escape (например во время запроса на сервер). */
  disabled?: boolean
  /** Колбэк закрытия без подтверждения (крестик, фон, Escape). */
  onClose: () => void
  /** Обработчик сабмита — если задан, карточка рендерится как `<form>`, иначе как `<div>`. */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  /** Содержимое футера — как правило кнопки действий. */
  footer: ReactNode
  /** Основное содержимое модалки. */
  children: ReactNode
}

/**
 * Общая оболочка модалки-карточки
 */
export const ModalShell = ({
  open,
  title,
  icon,
  variant = 'primary',
  disabled = false,
  onClose,
  onSubmit,
  footer,
  children,
}: Props) => {
  const handleClose = () => {
    if (!disabled) onClose()
  }

  const { backdropRef, isBackdropClick } = useBackdropClose(open)

  useEffect(() => {
    if (!open) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, disabled, onClose])

  const cardAnimation = {
    initial: { opacity: 0, scale: 0.92, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: 'spring', damping: 26, stiffness: 320 },
  } as const

  const cardBody = (
    <>
      <div className={`${styles.hero} ${variant === 'error' ? styles['hero--error'] : ''}`}>
        <button
          type="button"
          className={styles['hero__close']}
          onClick={handleClose}
          disabled={disabled}
          aria-label="close"
        >
          <X size={15} />
        </button>
        {icon}
        <h2 className={styles['hero__title']}>{title}</h2>
      </div>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>{footer}</div>
    </>
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-shell-backdrop"
            ref={backdropRef}
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (isBackdropClick()) handleClose()
            }}
          />
          <div className={styles.centering}>
            {onSubmit ? (
              <motion.form
                key="modal-shell-card"
                className={styles.card}
                onSubmit={onSubmit}
                {...cardAnimation}
              >
                {cardBody}
              </motion.form>
            ) : (
              <motion.div key="modal-shell-card" className={styles.card} {...cardAnimation}>
                {cardBody}
              </motion.div>
            )}
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
