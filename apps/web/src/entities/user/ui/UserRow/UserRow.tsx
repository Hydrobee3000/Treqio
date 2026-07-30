import { useState } from 'react'
import type { ReactNode } from 'react'
import { Skeleton } from '@mui/material'
import { Link } from 'react-router'
import styles from './UserRow.module.scss'

/**
 * Свойства UserRow.
 */
interface UserRowProps {
  /** Отображаемое имя пользователя. */
  displayName: string
  /** Никнейм — отсутствует, если не задан. */
  username?: string | null | undefined
  /** Адрес аватара — без него или при ошибке загрузки показывается инициал. */
  avatarUrl?: string | undefined
  /** Адрес профиля — строка становится ссылкой. */
  to?: string | undefined
  /** Кнопки действий справа. */
  action?: ReactNode
}

/**
 * Кружок аватара — картинка при наличии рабочей ссылки, иначе инициал имени.
 */
function Avatar({
  displayName,
  avatarUrl,
}: {
  displayName: string
  avatarUrl?: string | undefined
}) {
  const [failed, setFailed] = useState(false)

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={styles['user-row__avatar']}
        onError={() => setFailed(true)}
      />
    )
  }

  return <div className={styles['user-row__avatar']}>{displayName.charAt(0).toUpperCase()}</div>
}

/**
 * Строка пользователя: аватар, имя и никнейм.
 */
export const UserRow = ({ displayName, username, avatarUrl, to, action }: UserRowProps) => {
  const content = (
    <>
      <Avatar displayName={displayName} avatarUrl={avatarUrl} />
      <div className={styles['user-row__info']}>
        <span className={styles['user-row__name']}>{displayName}</span>
        {username && <span className={styles['user-row__username']}>@{username}</span>}
      </div>
    </>
  )

  // Действия лежат вне ссылки — иначе клик по кнопке уводил бы на профиль.
  if (action) {
    return (
      <div className={styles['user-row']}>
        {to ? (
          <Link to={to} className={styles['user-row__link']}>
            {content}
          </Link>
        ) : (
          <div className={styles['user-row__link']}>{content}</div>
        )}
        <div className={styles['user-row__actions']}>{action}</div>
      </div>
    )
  }

  return to ? (
    <Link to={to} className={`${styles['user-row']} ${styles['user-row__link']}`}>
      {content}
    </Link>
  ) : (
    <div className={`${styles['user-row']} ${styles['user-row__link']}`}>{content}</div>
  )
}

/**
 * Заглушка строки пользователя на время загрузки.
 */
export const UserRowSkeleton = () => (
  <div className={styles['user-row-skeleton']}>
    <Skeleton variant="circular" className={styles['user-row-skeleton__avatar']} />
    <div>
      <Skeleton variant="text" className={styles['user-row-skeleton__name']} />
      <Skeleton variant="text" className={styles['user-row-skeleton__username']} />
    </div>
  </div>
)
