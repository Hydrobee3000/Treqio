import { z } from 'zod'
import type { TFunction } from 'i18next'
import { DISPLAY_NAME_MAX, USERNAME_MAX, USERNAME_MIN } from '@/features/user/api/constraints'

/**
 * Схема валидации формы редактирования профиля. Username опционален —
 * у гостя его нет (нет учётной записи), поле в этом случае просто не рендерится.
 */
export const editProfileSchema = (t: TFunction) =>
  z.object({
    displayName: z
      .string()
      .trim()
      .min(1, t('profile.editProfile.nameRequiredError'))
      .max(DISPLAY_NAME_MAX),
    username: z
      .string()
      .trim()
      .min(USERNAME_MIN, t('profile.editProfile.usernameMinError', { min: USERNAME_MIN }))
      .max(USERNAME_MAX)
      .regex(/^[a-z0-9_]+$/, t('profile.editProfile.usernameFormatError'))
      .optional(),
  })

/**
 * Значения формы редактирования профиля.
 */
export type EditProfileFormValues = z.infer<ReturnType<typeof editProfileSchema>>
