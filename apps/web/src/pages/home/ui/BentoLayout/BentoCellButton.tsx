import type { ReactNode } from 'react'
import styles from './BentoLayout.module.scss'

/** Свойства кнопки-ячейки. */
interface Props {
  /** Иконка ячейки. */
  icon: ReactNode
  /** Заголовок ячейки. */
  title: string
  /** Описание ячейки. */
  desc: string
  /** Колбэк клика по ячейке. */
  onClick: () => void
  /** Вариант оформления. */
  variant?: 'hero' | 'dark'
}

/**
 * Кнопка-ячейка для bento-раскладки — иконка и заголовок с описанием.
 */
export function BentoCellButton({ icon, title, desc, onClick, variant }: Props) {
  return (
    <button
      className={`${styles['bento__cell']} ${variant ? styles[`bento__cell--${variant}`] : ''}`}
      onClick={onClick}
    >
      <div className={styles['bento__cell-icon']}>{icon}</div>
      <div className={styles['bento__cell-content']}>
        <p className={styles['bento__cell-title']}>{title}</p>
        <p className={styles['bento__cell-desc']}>{desc}</p>
      </div>
    </button>
  )
}
