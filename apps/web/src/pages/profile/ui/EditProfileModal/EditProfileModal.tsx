import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mui/material'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUpdateMeMutation } from '@/features/user'
import { DISPLAY_NAME_MAX, USERNAME_MAX } from '@/features/user/api/constraints'
import { setGuestDisplayName } from '@/features/guest'
import { useAppDispatch } from '@/shared/lib/store'
import { ModalShell } from '@/shared/ui'
import { editProfileSchema } from './editProfileSchema'
import type { EditProfileFormValues } from './editProfileSchema'
import styles from './EditProfileModal.module.scss'

/**
 * Свойства EditProfileModal.
 */
interface EditProfileModalProps {
  /** Флаг видимости модалки. */
  open: boolean
  /** Колбэк закрытия модалки. */
  onClose: () => void
  /** Флаг гостевого режима — у гостя нет username и учётной записи на сервере. */
  isGuest: boolean
  /** Текущее отображаемое имя. */
  displayName: string
  /** Текущий username — null для гостя. */
  username: string | null
}

/**
 * Модалка редактирования профиля — имя и username (последний недоступен гостю).
 */
export const EditProfileModal = ({
  open,
  onClose,
  isGuest,
  displayName,
  username,
}: EditProfileModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema(t)),
    defaultValues: { displayName, username: username ?? undefined },
  })

  const [displayNameVal, usernameVal] = useWatch({ control, name: ['displayName', 'username'] })
  const displayNameLength = displayNameVal?.length ?? 0
  const usernameLength = usernameVal?.length ?? 0

  // Подтягиваем актуальные значения при каждом открытии — форма могла
  // остаться с предыдущими значениями/ошибками с прошлого открытия.
  useEffect(() => {
    if (open) reset({ displayName, username: username ?? undefined })
  }, [open, displayName, username, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (isGuest) {
      dispatch(setGuestDisplayName(values.displayName))
      onClose()
      return
    }

    if (!isDirty) {
      onClose()
      return
    }

    try {
      await updateMe({ displayName: values.displayName, username: values.username }).unwrap()
      onClose()
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 409
      ) {
        setError('username', { message: t('profile.editProfile.usernameTaken') })
      } else {
        setError('root', { message: t('profile.editProfile.saveError') })
      }
    }
  })

  return (
    <ModalShell
      open={open}
      title={t('profile.editProfile.title')}
      icon={<Settings size={16} />}
      disabled={isSaving}
      onClose={onClose}
      onSubmit={(e) => void onSubmit(e)}
      footer={
        <>
          <Button
            type="button"
            variant="outlined"
            size="small"
            className={styles['footer__btn-cancel']}
            onClick={onClose}
            disabled={isSaving}
          >
            {t('profile.editProfile.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            className={styles['footer__btn-save']}
            disabled={isSaving}
          >
            {isSaving ? t('profile.editProfile.saving') : t('profile.editProfile.save')}
          </Button>
        </>
      }
    >
      <div className={styles.field}>
        <label className={styles['field__label']}>{t('profile.editProfile.displayName')}</label>
        <div className={styles['field__row']}>
          <input
            className={styles['field__input']}
            autoFocus
            autoComplete="off"
            maxLength={DISPLAY_NAME_MAX}
            {...register('displayName')}
          />
          <span
            className={`${styles['field__counter']} ${
              displayNameLength > DISPLAY_NAME_MAX
                ? styles['field__counter--max']
                : styles['field__counter--warn']
            }`}
            style={{ visibility: displayNameLength >= DISPLAY_NAME_MAX - 5 ? 'visible' : 'hidden' }}
          >
            {displayNameLength}/{DISPLAY_NAME_MAX}
          </span>
        </div>
        {errors.displayName && (
          <p className={styles['field__error']}>{errors.displayName.message}</p>
        )}
      </div>

      {!isGuest && (
        <div className={styles.field}>
          <label className={styles['field__label']}>{t('profile.editProfile.username')}</label>
          <div className={styles['field__row']}>
            <span className={styles['field__username-prefix']}>@</span>
            <input
              className={styles['field__input']}
              autoComplete="off"
              maxLength={USERNAME_MAX}
              {...register('username')}
            />
            <span
              className={`${styles['field__counter']} ${
                usernameLength > USERNAME_MAX
                  ? styles['field__counter--max']
                  : styles['field__counter--warn']
              }`}
              style={{ visibility: usernameLength >= USERNAME_MAX - 5 ? 'visible' : 'hidden' }}
            >
              {usernameLength}/{USERNAME_MAX}
            </span>
          </div>
          {errors.username && <p className={styles['field__error']}>{errors.username.message}</p>}
        </div>
      )}

      {errors.root && <p className={styles['field__error']}>{errors.root.message}</p>}
    </ModalShell>
  )
}
