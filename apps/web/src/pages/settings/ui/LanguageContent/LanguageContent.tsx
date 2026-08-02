import { useTranslation } from 'react-i18next'
import styles from './LanguageContent.module.scss'

/**
 * Содержимое раздела «Язык».
 */
export function LanguageContent() {
  const { t, i18n } = useTranslation()

  const languages: { code: 'ru' | 'en'; label: string }[] = [
    { code: 'ru', label: t('settings.language.ru') },
    { code: 'en', label: t('settings.language.en') },
  ]

  return (
    <div className={styles['language-picker']}>
      {languages.map(({ code, label }) => (
        <button
          key={code}
          className={`${styles['language-btn']} ${i18n.language === code ? styles['language-btn--active'] : ''}`}
          onClick={() => void i18n.changeLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
