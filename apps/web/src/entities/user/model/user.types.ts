/**
 * Пользователь приложения.
 */
export interface User {
  /** Уникальный идентификатор. */
  id: string
  /** Уникальный публичный username для URL профиля. */
  username: string
  /** Отображаемое имя. */
  displayName: string
  /** Email аккаунта. */
  email: string
  /** URL аватара от OAuth-провайдера. */
  avatarUrl: string | null
  /** Краткое описание профиля. */
  bio: string | null
  /** OAuth-провайдер: 'google' | 'github'. */
  provider: string
  /** Дата регистрации. */
  createdAt: string
  /** Дата последнего обновления профиля. */
  updatedAt: string
}
