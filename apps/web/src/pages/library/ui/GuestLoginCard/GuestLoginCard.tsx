import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Typography } from '@mui/material'
import { X, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './GuestLoginCard.module.scss'

/**
 * Свойства диалога авторизации для гостя.
 */
interface Props {
  /** Флаг видимости диалога. */
  open: boolean
  /** Колбэк закрытия диалога. */
  onClose: () => void
  /** Колбэк перехода на страницу входа. */
  onLogin: () => void
}

/**
 * Диалог с предложением войти в аккаунт, показывается гостю при попытке добавить книгу.
 */
export const GuestLoginCard = ({ open, onClose, onLogin }: Props) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="guest-backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div className={styles.centering}>
            <motion.div
              key="guest-card"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            >
              <div className={styles.hero}>
                <button className={styles['hero__close']} onClick={onClose} aria-label="close">
                  <X size={15} />
                </button>
                <h2 className={styles['hero__title']}>{t('library.loginRequired.title')}</h2>
              </div>
              <div className={styles.content}>
                <Typography variant="body2" color="text.secondary">
                  {t('library.loginRequired.desc')}
                </Typography>
              </div>
              <div className={styles.footer}>
                <Button
                  variant="outlined"
                  size="small"
                  className={styles['footer__btn-cancel']}
                  onClick={onClose}
                >
                  {t('library.loginRequired.cancel')}
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  className={styles['footer__btn-login']}
                  startIcon={<LogIn size={15} />}
                  onClick={onLogin}
                >
                  {t('library.loginRequired.login')}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
