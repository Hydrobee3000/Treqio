import { useTranslation } from 'react-i18next'
import { useGetMeQuery, useUpdateMeMutation } from '@/features/user'
import { useAppSelector } from '@/shared/lib/store'
import { EntriesVisibilityPicker } from '../EntriesVisibilityPicker/EntriesVisibilityPicker'
import styles from './PrivacyContent.module.scss'

/**
 * Содержимое раздела «Приватность».
 */
export function PrivacyContent() {
  const { t } = useTranslation()
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const { data: me, isLoading } = useGetMeQuery(undefined, { skip: isGuest })
  const [updateMe, { isLoading: isSaving, isError }] = useUpdateMeMutation()

  const shareActivity = me?.shareActivity ?? true

  const handleToggleShareActivity = async () => {
    try {
      await updateMe({ shareActivity: !shareActivity }).unwrap()
    } catch {
      // Значение берётся из профиля, поэтому при ошибке переключатель остаётся прежним.
    }
  }

  return (
    <>
      <p className={styles['privacy__label']}>{t('settings.privacy.label')}</p>
      <EntriesVisibilityPicker />

      {!isGuest && (
        <>
          <hr className={styles['privacy__divider']} />
          <p className={styles['privacy__label']}>{t('settings.privacy.shareActivity.title')}</p>
          <button
            className={styles['share-row']}
            onClick={() => void handleToggleShareActivity()}
            disabled={isLoading || isSaving}
            aria-label={
              shareActivity
                ? t('settings.privacy.shareActivity.disable')
                : t('settings.privacy.shareActivity.enable')
            }
          >
            <span className={styles['share-row__desc']}>
              {t('settings.privacy.shareActivity.label')}
            </span>
            <span
              className={`${styles['share-toggle']} ${shareActivity ? styles['share-toggle--on'] : ''}`}
            >
              <span className={styles['share-toggle__thumb']} />
            </span>
          </button>

          {isError && <p className={styles['privacy__error']}>{t('settings.privacy.saveError')}</p>}
        </>
      )}
    </>
  )
}
