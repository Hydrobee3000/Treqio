import type { ReactNode } from 'react'
import { Button } from '@mui/material'
import { ModalShell } from '../ModalShell/ModalShell'
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
  description: ReactNode
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
}: Props) => (
  <ModalShell
    open={open}
    title={title}
    variant={confirmColor}
    disabled={disabled}
    onClose={onCancel}
    footer={
      <>
        <Button
          variant="outlined"
          size="small"
          className={styles['footer__btn-cancel']}
          onClick={onCancel}
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
      </>
    }
  >
    <p className={styles.description}>{description}</p>
    {error && <p className={styles['content__error']}>{error}</p>}
  </ModalShell>
)
