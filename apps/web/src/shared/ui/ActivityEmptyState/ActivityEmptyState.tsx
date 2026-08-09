import styles from './ActivityEmptyState.module.scss'

/** Один ряд ленты-заглушки. */
interface TickerRow {
  /** Пунктирная обводка вместо сплошной. */
  dashed?: boolean
  /** Акцентный вариант вместо нейтрального. */
  accent?: boolean
  /** Ширина полоски-имени в px. */
  nameWidth: number
}

/** Три уникальных ряда, зацикленные дублированием. */
const TICKER_ROWS: TickerRow[] = [
  { nameWidth: 52 },
  { dashed: true, accent: true, nameWidth: 64 },
  { nameWidth: 44 },
]
const TICKER_ROWS_LOOPED = [...TICKER_ROWS, ...TICKER_ROWS]

/** Естественные размеры бегущей ленты — масштаб применяется поверх них. */
const TICKER_WIDTH = 280
const TICKER_HEIGHT = 162

/**
 * Свойства ActivityEmptyState.
 */
interface Props {
  /** Заголовок. */
  title: string
  /** Пояснение под заголовком. */
  description: string
  /** Масштаб бегущей ленты. По умолчанию 1. */
  scale?: number
}

/**
 * Пустое состояние активности — общее для ленты друзей и истории профиля.
 */
export function ActivityEmptyState({ title, description, scale = 1 }: Props) {
  return (
    <div className={styles['activity-empty']}>
      <div
        className={styles['activity-empty__ticker-wrap']}
        style={{ width: TICKER_WIDTH * scale, height: TICKER_HEIGHT * scale }}
      >
        <div className={styles['activity-empty__ticker']} style={{ transform: `scale(${scale})` }}>
          <div className={styles['activity-empty__ticker-track']}>
            {TICKER_ROWS_LOOPED.map((row, i) => (
              <div
                key={i}
                className={`${styles['activity-empty__row']} ${row.dashed ? styles['activity-empty__row--dashed'] : ''} ${row.accent ? styles['activity-empty__row--accent'] : ''}`}
              >
                <span className={styles['activity-empty__row-dot']} />
                <span
                  className={styles['activity-empty__row-name']}
                  style={{ width: `${row.nameWidth}px` }}
                />
                <span className={styles['activity-empty__row-line']} />
                <span className={styles['activity-empty__row-badge']} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <h2 className={styles['activity-empty__title']}>{title}</h2>
      <p className={styles['activity-empty__desc']}>{description}</p>
    </div>
  )
}
