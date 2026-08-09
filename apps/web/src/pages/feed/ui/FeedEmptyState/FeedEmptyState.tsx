import { useTranslation } from 'react-i18next'
import styles from './FeedEmptyState.module.scss'

/** Один ряд ленты-заглушки. */
interface TickerRow {
  dashed?: boolean
  accent?: boolean
  nameWidth: number
}

/** Три уникальных ряда, зацикленные дублированием. */
const TICKER_ROWS: TickerRow[] = [
  { nameWidth: 52 },
  { dashed: true, accent: true, nameWidth: 64 },
  { nameWidth: 44 },
]
const TICKER_ROWS_LOOPED = [...TICKER_ROWS, ...TICKER_ROWS]

/**
 * Пустое состояние ленты активности.
 */
export function FeedEmptyState() {
  const { t } = useTranslation()

  return (
    <div className={styles['feed-empty']}>
      <div className={styles['feed-empty__ticker']}>
        <div className={styles['feed-empty__ticker-track']}>
          {TICKER_ROWS_LOOPED.map((row, i) => (
            <div
              key={i}
              className={`${styles['feed-empty__row']} ${row.dashed ? styles['feed-empty__row--dashed'] : ''} ${row.accent ? styles['feed-empty__row--accent'] : ''}`}
            >
              <span className={styles['feed-empty__row-dot']} />
              <span
                className={styles['feed-empty__row-name']}
                style={{ width: `${row.nameWidth}px` }}
              />
              <span className={styles['feed-empty__row-line']} />
              <span className={styles['feed-empty__row-badge']} />
            </div>
          ))}
        </div>
      </div>
      <h2 className={styles['feed-empty__title']}>{t('feed.empty.title')}</h2>
      <p className={styles['feed-empty__desc']}>{t('feed.empty.desc')}</p>
    </div>
  )
}
