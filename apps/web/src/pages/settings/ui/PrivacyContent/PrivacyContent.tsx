import { useTranslation } from 'react-i18next'
import styles from './PrivacyContent.module.scss'

/**
 * Содержимое раздела «Приватность».
 */
export function PrivacyContent() {
  const { t } = useTranslation()

  return (
    <>
      <p className={styles['privacy__label']}>{t('settings.privacy.label')}</p>
      <p className={styles['privacy__desc']}>{t('settings.privacy.desc')}</p>
    </>
  )
}
