import { Skeleton } from '@mui/material'
import type { CSSProperties } from 'react'
import styles from './HistorySkeleton.module.scss'

/**
 * Заглушка таймлайна истории на время загрузки.
 */
export function HistorySkeleton() {
  return (
    <div className={styles['history']}>
      {[3, 2].map((count, gi) => (
        <div key={gi} className={styles['history__day']}>
          <Skeleton variant="rounded" className={styles['history__date-skeleton']} />
          <div className={styles['history__timeline']}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className={styles['history__event']}>
                <Skeleton variant="circular" className={styles['history__node-skeleton']} />
                <div className={styles['history__body']}>
                  <Skeleton
                    variant="text"
                    className={styles['history__text-skeleton']}
                    style={{ '--skeleton-width': `${130 + i * 30}px` } as CSSProperties}
                  />
                </div>
                <Skeleton variant="text" className={styles['history__time-skeleton']} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
