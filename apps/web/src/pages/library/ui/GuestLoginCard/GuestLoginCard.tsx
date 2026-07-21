import { LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ConfirmCard } from '@/shared/ui'

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

  return (
    <ConfirmCard
      open={open}
      title={t('library.loginRequired.title')}
      description={t('library.loginRequired.desc')}
      cancelLabel={t('library.loginRequired.cancel')}
      confirmLabel={t('library.loginRequired.login')}
      confirmIcon={<LogIn size={15} />}
      onCancel={onClose}
      onConfirm={onLogin}
    />
  )
}
