import { CircularProgress } from '@mui/material'
import { useAuthCallback } from '../model/useAuthCallback'
import styles from './AuthCallbackPage.module.scss'

/**
 * Обработчик редиректа после OAuth авторизации.
 */
export function AuthCallbackPage() {
  useAuthCallback()

  return (
    <div className={styles['auth-callback']}>
      <CircularProgress />
    </div>
  )
}
