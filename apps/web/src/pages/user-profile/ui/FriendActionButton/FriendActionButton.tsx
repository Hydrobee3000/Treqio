import { Check, Clock, UserCheck, UserPlus, X } from 'lucide-react'
import { Tooltip, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { FriendshipState } from '@/features/user'
import styles from './FriendActionButton.module.scss'

/**
 * Свойства FriendActionButton.
 */
interface Props {
  /** Состояние связи с просматриваемым пользователем. */
  state: FriendshipState
  /** Флаг выполняющегося запроса — блокирует кнопки. */
  busy: boolean
  /** Функция отправки заявки в друзья. */
  onAdd: () => void
  /** Функция принятия входящей заявки. */
  onAccept: () => void
  /** Функция отмены заявки, отклонения или удаления из друзей. */
  onRemove: () => void
}

/**
 * Кнопка действия с пользователем в шапке его профиля.
 */
export const FriendActionButton = ({ state, busy, onAdd, onAccept, onRemove }: Props) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  /** Кнопка с подписью, скрываемой на мобильных. */
  const button = (
    variant: 'primary' | 'muted',
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
  ) => {
    const element = (
      <button
        className={`${styles['friend-btn']} ${styles[`friend-btn--${variant}`]}`}
        onClick={onClick}
        disabled={busy}
        aria-label={label}
      >
        {icon}
        <span className={styles['friend-btn__label']}>{label}</span>
      </button>
    )
    return isMobile ? <Tooltip title={label}>{element}</Tooltip> : element
  }

  if (state === 'FRIENDS') {
    return button('muted', <UserCheck size={15} />, t('userProfile.friendship.friends'), onRemove)
  }

  if (state === 'REQUEST_SENT') {
    return button('muted', <Clock size={15} />, t('userProfile.friendship.requestSent'), onRemove)
  }

  if (state === 'REQUEST_RECEIVED') {
    return (
      <div className={styles['friend-actions']}>
        {button('primary', <Check size={15} />, t('userProfile.friendship.accept'), onAccept)}
        <Tooltip title={t('userProfile.friendship.reject')}>
          <button
            className={styles['friend-btn__reject']}
            onClick={onRemove}
            disabled={busy}
            aria-label={t('userProfile.friendship.reject')}
          >
            <X size={15} />
          </button>
        </Tooltip>
      </div>
    )
  }

  return button('primary', <UserPlus size={15} />, t('userProfile.friendship.add'), onAdd)
}
