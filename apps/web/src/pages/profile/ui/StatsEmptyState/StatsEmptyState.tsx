import { useTranslation } from 'react-i18next'
import styles from './StatsEmptyState.module.scss'

/** Базовая высота столбца в px. */
const BAR_HEIGHTS = [34, 50, 28, 44, 58, 38, 48]

/**
 * Пустое состояние вкладки статистики.
 */
export function StatsEmptyState() {
  const { t } = useTranslation()

  return (
    <div className={styles['stats-empty']}>
      <div className={styles['stats-empty__bars']}>
        {BAR_HEIGHTS.map((height, i) => (
          <span
            key={i}
            className={`${styles['stats-empty__bar']} ${styles[`stats-empty__bar--${i + 1}`]}`}
            style={{ height }}
          />
        ))}
      </div>
      <p className={styles['stats-empty__text']}>{t('profile.stats.empty')}</p>
    </div>
  )
}
