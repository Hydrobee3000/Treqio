import { ArrowRight, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import styles from './GuestLoginCard.module.scss'

/**
 * Карточка-подсказка 'войти' - показывается гостю внизу сетки быстрых действий.
 */
export function GuestLoginCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <button className={styles['guest-login-card']} onClick={() => navigate('/login')}>
      <div className={styles['guest-login-card__left']}>
        <div className={styles['guest-login-card__icon']}>
          <LogIn size={18} />
        </div>
        <div>
          <p className={styles['guest-login-card__title']}>{t('home.cards.login.title')}</p>
          <p className={styles['guest-login-card__sub']}>{t('home.cards.login.desc')}</p>
        </div>
      </div>
      <span className={styles['guest-login-card__arrow']}>
        <ArrowRight size={16} strokeWidth={2} />
      </span>
    </button>
  )
}
