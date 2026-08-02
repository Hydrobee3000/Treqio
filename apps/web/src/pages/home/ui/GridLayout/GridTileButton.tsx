import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import styles from './GridLayout.module.scss'

/** Свойства кнопки-плитки. */
interface Props {
  /** Иконка плитки. */
  icon: ReactNode
  /** Заголовок плитки. */
  title: string
  /** Описание плитки. */
  desc: string
  /** Колбэк клика по плитке. */
  onClick: () => void
}

/**
 * Кнопка-плитка для сетки 2×2 — иконка, заголовок с описанием и стрелка.
 */
export function GridTileButton({ icon, title, desc, onClick }: Props) {
  return (
    <button className={styles['grid__tile']} onClick={onClick}>
      <div className={styles['grid__tile-icon']}>{icon}</div>
      <div>
        <p className={styles['grid__tile-title']}>{title}</p>
        <p className={styles['grid__tile-desc']}>{desc}</p>
      </div>
      <span className={styles['grid__tile-arrow']}>
        <ArrowRight size={16} strokeWidth={2} />
      </span>
    </button>
  )
}
