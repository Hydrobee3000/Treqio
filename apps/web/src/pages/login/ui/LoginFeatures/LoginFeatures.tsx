import { BarChart2, LibraryBig, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './LoginFeatures.module.scss'

/**
 * Иконки для фич лендинга.
 */
const FEATURE_ICONS = [
  <LibraryBig key="progress" size={18} color="#4E7B6A" />,
  <Palette key="feed" size={18} color="#4E7B6A" />,
  <BarChart2 key="stats" size={18} color="#4E7B6A" />,
]

/**
 * Ключи фич для получения переводов.
 */
const FEATURE_KEYS = ['progress', 'feed', 'stats'] as const

/** Свойства LoginFeatures. */
interface Props {
  /** Флаг мобильного экрана — переключает подпись на укороченный вариант. */
  isMobile: boolean
}

/**
 * Панель фич лендинга внизу экрана.
 */
export function LoginFeatures({ isMobile }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles['login-page__features']}>
      {FEATURE_KEYS.map((key, i) => (
        <div key={key} className={styles['login-page__feature-item']}>
          <div className={styles['login-page__feature-label-row']}>
            <div className={styles['login-page__feature-icon']}>{FEATURE_ICONS[i]}</div>
            <div className={styles['login-page__feature-label']}>
              <span className={styles['login-page__feature-label-text']}>
                {isMobile
                  ? t(`login.features.${key}.mobileLabel`)
                  : t(`login.features.${key}.label`)}
              </span>
            </div>
          </div>
          <p className={styles['login-page__feature-description']}>
            {t(`login.features.${key}.text`)}
          </p>
        </div>
      ))}
    </div>
  )
}
