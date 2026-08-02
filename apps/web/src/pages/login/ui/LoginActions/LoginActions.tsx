import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import styles from './LoginActions.module.scss'

/** Свойства LoginActions. */
interface Props {
  /** Колбэк входа через Google. */
  onGoogleLogin: () => void
  /** Колбэк входа в гостевом режиме. */
  onGuestLogin: () => void
}

/**
 * Кнопки входа — Google и гостевой режим, с разделителем и хинтом на мобилке.
 */
export function LoginActions({ onGoogleLogin, onGuestLogin }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles['login-page__buttons']}>
      <Button
        variant="contained"
        size="large"
        onClick={onGoogleLogin}
        className={styles['login-page__google-btn']}
      >
        {t('login.googleLogin')}
      </Button>

      <div className={styles['login-page__or-divider']}>
        <span className={styles['login-page__or-line']} />
        {t('login.or')}
        <span className={styles['login-page__or-line']} />
      </div>

      <span className={styles['login-page__guest-btn-wrapper']}>
        <Button
          variant="outlined"
          size="large"
          onClick={onGuestLogin}
          className={styles['login-page__guest-btn']}
        >
          {t('login.guestLogin')}
        </Button>
      </span>

      <p className={styles['login-page__hint']}>{t('login.guestHint')}</p>
    </div>
  )
}
