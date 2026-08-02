import { Check } from 'lucide-react'
import type { LIGHT_THEMES } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'
import styles from './ThemeCard.module.scss'

type ThemeMeta = (typeof LIGHT_THEMES)[number]

/** Свойства ThemeCard. */
interface Props {
  /** Метаданные темы (цвета превью, название). */
  theme: ThemeMeta
  /** Флаг выбранной темы. */
  isActive: boolean
  /** Колбэк выбора темы. */
  onSelect: (variant: ThemeVariant) => void
}

/**
 * Карточка выбора темы с визуальным превью цветов.
 */
export function ThemeCard({ theme, isActive, onSelect }: Props) {
  const footerStyle = theme.isDark
    ? { background: theme.bgColor, color: isActive ? theme.primaryColor : '#E8E3DA' }
    : undefined

  return (
    <button
      className={`${styles['theme-card']} ${isActive ? styles['theme-card--active'] : ''}`}
      onClick={() => onSelect(theme.variant)}
    >
      <div className={styles['theme-card__preview']}>
        <div className={styles['theme-card__sidebar']} style={{ background: theme.sidebarColor }} />
        <div className={styles['theme-card__content']} style={{ background: theme.bgColor }}>
          <div className={styles['theme-card__dot']} style={{ background: theme.primaryColor }} />
          <div className={`${styles['theme-card__line']} ${styles['theme-card__line--wide']}`} />
          <div className={`${styles['theme-card__line']} ${styles['theme-card__line--narrow']}`} />
        </div>
        {isActive && (
          <span className={styles['theme-card__check']}>
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className={styles['theme-card__footer']} style={footerStyle}>
        {theme.name}
      </div>
    </button>
  )
}
