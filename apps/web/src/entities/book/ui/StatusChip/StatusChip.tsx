import { useTranslation } from 'react-i18next'
import { STATUS_TEXT_COLOR } from '../../model/book.types'
import type { BookStatus } from '../../model/book.types'
import styles from './StatusChip.module.scss'

/**
 * Свойства StatusChip.
 */
interface StatusChipProps {
  /** Статус записи. */
  status: BookStatus
}

/**
 * Компонент статуса записи.
 */
export function StatusChip({ status }: StatusChipProps) {
  const { t } = useTranslation()
  const color = STATUS_TEXT_COLOR[status]
  return (
    <span
      className={styles['status-chip']}
      style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      {t(`book.status.${status}`)}
    </span>
  )
}
