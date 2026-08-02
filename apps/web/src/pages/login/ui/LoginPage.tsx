import { useMediaQuery, useTheme } from '@mui/material'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/shared/lib/store'
import { enterAsGuest } from '@/features/auth'
import { baseApi } from '@/shared/api/baseApi'
import { BookCardsRow } from './BookCardsRow/BookCardsRow'
import { LoginActions } from './LoginActions/LoginActions'
import { LoginFeatures } from './LoginFeatures/LoginFeatures'
import styles from './LoginPage.module.scss'

const API_URL = import.meta.env['VITE_API_URL'] as string

/**
 * Landing-страница для неавторизованных пользователей.
 */
export function LoginPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  /**
   *  Авторизация через гугл.
   */
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  /**
   *  Вход в гостевой режим без регистрации.
   */
  const handleGuestLogin = () => {
    dispatch(enterAsGuest())
    dispatch(baseApi.util.resetApiState())
    navigate('/')
  }

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-page__hero']}>
        <div className={styles['login-page__brand']}>
          <span className={styles['login-page__logo-icon']} />
          <p className={styles['login-page__logo']}>Treqio</p>
        </div>

        <p className={styles['login-page__tagline']}>{t('login.description')}</p>
        <p className={styles['login-page__description']}>{t('login.additionalDescription')}</p>

        <LoginActions onGoogleLogin={handleGoogleLogin} onGuestLogin={handleGuestLogin} />

        <BookCardsRow isMobile={isMobile} />

        <LoginFeatures isMobile={isMobile} />
      </div>
    </div>
  )
}
