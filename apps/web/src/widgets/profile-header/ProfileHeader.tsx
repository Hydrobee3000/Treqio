import type { CSSProperties, ReactNode } from 'react'
import { Skeleton } from '@mui/material'
import styles from './ProfileHeader.module.scss'

/**
 * Свойства ProfileHeader.
 */
interface ProfileHeaderProps {
  /** Отображаемое имя пользователя. */
  displayName: string
  /** Никнейм */
  username?: string | null | undefined
  /** Краткое описание профиля. */
  bio?: string | null | undefined
  /** Кнопка в углу шапки — приходит со своими размерами и позиционированием. */
  cornerAction?: ReactNode
  /** Кнопка действия справа от имени. */
  action?: ReactNode
  /** Дополнительный класс корня — для отступов, специфичных для страницы. */
  className?: string | undefined
}

/**
 * Шапка профиля — общая для своего профиля и профиля другого пользователя.
 *
 * Различия между страницами выражаются переданными кнопками: компонент не
 * задаёт им ни размер, ни положение, а только создаёт контекст позиционирования.
 */
export const ProfileHeader = ({
  displayName,
  username,
  bio,
  cornerAction,
  action,
  className,
}: ProfileHeaderProps) => (
  <div className={`${styles['profile-header']} ${className ?? ''}`}>
    {cornerAction}
    <div className={styles['profile-header__top']}>
      <div className={styles['profile-header__avatar']}>{displayName.charAt(0).toUpperCase()}</div>
      <div className={styles['profile-header__info']}>
        <h1 className={styles['profile-header__name']}>{displayName}</h1>
        <div className={styles['profile-header__meta']}>{username && <span>@{username}</span>}</div>
        {bio && <p className={styles['profile-header__bio']}>{bio}</p>}
      </div>
      {action}
    </div>
  </div>
)

/**
 * Свойства ProfileHeaderSkeleton.
 */
interface ProfileHeaderSkeletonProps {
  /** Ширина плашки на месте кнопки действия. */
  actionWidth: number
  /** Дополнительный класс корня — для отступов, специфичных для страницы. */
  className?: string | undefined
}

/**
 * Скелет шапки профиля на время загрузки.
 */
export const ProfileHeaderSkeleton = ({ actionWidth, className }: ProfileHeaderSkeletonProps) => (
  <div className={`${styles['profile-header']} ${className ?? ''}`}>
    <div className={styles['profile-header__top']}>
      <Skeleton variant="circular" className={styles['profile-header__skeleton-avatar']} />
      <div className={styles['profile-header__info']}>
        <Skeleton variant="rounded" className={styles['profile-header__skeleton-name']} />
        <div className={styles['profile-header__meta']}>
          <Skeleton variant="text" className={styles['profile-header__skeleton-meta']} />
        </div>
      </div>
      <Skeleton
        variant="rounded"
        className={styles['profile-header__skeleton-action']}
        style={{ '--action-width': `${actionWidth}px` } as CSSProperties}
      />
    </div>
  </div>
)
