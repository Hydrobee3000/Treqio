import { useState } from 'react'
import type { CSSProperties } from 'react'
import styles from './Avatar.module.scss'

/**
 * Свойства Avatar.
 */
interface AvatarProps {
  /** Отображаемое имя — источник инициала для запасного варианта. */
  displayName: string
  /** Адрес аватара — без него или при ошибке загрузки показывается инициал. */
  avatarUrl?: string | undefined
  /** Диаметр в пикселях. По умолчанию 44. */
  size?: number
  /** Дополнительный класс для позиционирования в родителе. */
  className?: string | undefined
}

/**
 * Кружок аватара — картинка при наличии рабочей ссылки, иначе инициал имени.
 */
export function Avatar({ displayName, avatarUrl, size = 44, className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const rootClass = [styles['avatar'], className].filter(Boolean).join(' ')
  const style: CSSProperties = { width: size, height: size, fontSize: size * 0.38 }

  if (avatarUrl && !failed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={rootClass}
        style={style}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className={rootClass} style={style}>
      {displayName.charAt(0).toUpperCase()}
    </div>
  )
}
