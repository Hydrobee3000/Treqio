import type { ReactNode } from 'react'
import styles from './EmptyState.module.scss'

/**
 * Свойства EmptyState.
 */
interface Props {
  /** Иконка — уже отмасштабированная вызывающей стороной. */
  icon: ReactNode
  /** Заголовок. */
  title: string
  /** Пояснение под заголовком. */
  description?: string | undefined
  /** Кнопка действия, если у пустого состояния есть выход (например «Войти»). */
  action?: ReactNode
  /** Растягивается на всю высоту родителя и центрируется по вертикали —
   * для состояний, занимающих вкладку целиком. По умолчанию компактный блок
   * без растяжения — для пустых результатов внутри списка. */
  fullHeight?: boolean
}

/**
 * Пустое состояние — иконка, заголовок, необязательные пояснение и действие.
 */
export const EmptyState = ({ icon, title, description, action, fullHeight }: Props) => (
  <div className={`${styles['empty-state']} ${fullHeight ? styles['empty-state--full'] : ''}`}>
    <div className={styles['empty-state__icon']}>{icon}</div>
    <p className={styles['empty-state__text']}>{title}</p>
    {description && <p className={styles['empty-state__sub']}>{description}</p>}
    {action}
  </div>
)
