import { useEffect } from 'react'
import { Button } from '@mui/material'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRouteError } from 'react-router'
import styles from './ErrorFallback.module.scss'

/**
 * Фолбэк маршрута react-router (errorElement) — показывается вместо упавшего
 * маршрута, в том числе при сбое ленивой подгрузки чанка страницы после деплоя.
 */
export function ErrorFallback() {
  const { t } = useTranslation()
  const error = useRouteError()

  useEffect(() => {
    console.error('Unhandled route error:', error)
  }, [error])

  return (
    <div className={styles['error-fallback']}>
      <div className={styles['error-fallback__card']}>
        <h1 className={styles['error-fallback__title']}>{t('errorBoundary.title')}</h1>
        <p className={styles['error-fallback__desc']}>{t('errorBoundary.desc')}</p>
        <Button
          variant="contained"
          startIcon={<RefreshCw size={16} />}
          onClick={() => window.location.reload()}
        >
          {t('errorBoundary.reload')}
        </Button>
      </div>
    </div>
  )
}
