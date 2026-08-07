import type { ReactNode } from 'react'
import { EyeOff, Globe, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGetMeQuery, useUpdateMeMutation } from '@/features/user'
import type { EntriesVisibility } from '@/features/user'
import styles from './EntriesVisibilityPicker.module.scss'

/**
 * Вариант видимости записей.
 */
interface VisibilityOption {
  /** Значение, сохраняемое в профиле. */
  value: EntriesVisibility
  /** Иконка варианта. */
  icon: ReactNode
}

const OPTIONS: VisibilityOption[] = [
  { value: 'PUBLIC', icon: <Globe size={18} /> },
  { value: 'FRIENDS', icon: <Users size={18} /> },
  { value: 'PRIVATE', icon: <EyeOff size={18} /> },
]

/**
 * Выбор того, кому видны записи пользователя.
 */
export function EntriesVisibilityPicker() {
  const { t } = useTranslation()
  const { data: me, isLoading } = useGetMeQuery()
  const [updateMe, { isLoading: isSaving, isError }] = useUpdateMeMutation()

  const handleSelect = async (value: EntriesVisibility) => {
    if (value === me?.entriesVisibility) return
    try {
      await updateMe({ entriesVisibility: value }).unwrap()
    } catch {
      // Значение берётся из профиля, поэтому при ошибке выбор остаётся прежним.
    }
  }

  return (
    <div className={styles['visibility']}>
      {OPTIONS.map(({ value, icon }) => (
        <button
          key={value}
          className={`${styles['visibility__option']} ${me?.entriesVisibility === value ? styles['visibility__option--active'] : ''}`}
          disabled={isLoading || isSaving}
          onClick={() => void handleSelect(value)}
        >
          <span className={styles['visibility__icon']}>{icon}</span>
          <span className={styles['visibility__text']}>
            <span className={styles['visibility__label']}>
              {t(`settings.privacy.visibility.${value}.label`)}
            </span>
            <span className={styles['visibility__desc']}>
              {t(`settings.privacy.visibility.${value}.desc`)}
            </span>
          </span>
        </button>
      ))}

      {isError && <p className={styles['visibility__error']}>{t('settings.privacy.saveError')}</p>}
    </div>
  )
}
