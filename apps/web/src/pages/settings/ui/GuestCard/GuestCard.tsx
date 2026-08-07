import { TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import styles from './GuestCard.module.scss'

/**
 * Карточка-приглашение войти — показывается гостю там, где нужна авторизация.
 */
export function GuestCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={styles['guest-card']}>
      <div className={styles['guest-card__left']}>
        <div className={styles['guest-card__icon']}>
          <TriangleAlert size={18} />
        </div>
        <div>
          <p className={styles['guest-card__title']}>{t('settings.guest.title')}</p>
          <p className={styles['guest-card__sub']}>{t('settings.guest.desc')}</p>
        </div>
      </div>
      <button className={styles['guest-card__btn']} onClick={() => navigate('/login')}>
        {t('settings.guest.login')}
      </button>
    </div>
  )
}
