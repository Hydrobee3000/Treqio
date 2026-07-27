/**
 * Ограничения полей профиля — синхронизированы с backend DTO.
 */

/** Максимальная длина отображаемого имени. */
export const DISPLAY_NAME_MAX = 25

/** Минимальная длина никнейма. */
export const USERNAME_MIN = 3

/** Максимальная длина никнейма. */
export const USERNAME_MAX = 20

/** Максимальная длина bio. */
export const BIO_MAX = 200

/**
 * Никнеймы, недоступные для занятия — профиль открывается по адресу вида
 * `/:username`, поэтому такой никнейм перехватывал бы маршрут приложения.
 * Синхронизирован с `reserved-usernames.ts` на backend.
 */
export const RESERVED_USERNAMES = [
  'about',
  'admin',
  'api',
  'auth',
  'book',
  'books',
  'feed',
  'friends',
  'help',
  'home',
  'library',
  'login',
  'logout',
  'me',
  'new',
  'privacy',
  'profile',
  'register',
  'root',
  'search',
  'settings',
  'signin',
  'signup',
  'support',
  'terms',
  'treqio',
  'user',
  'users',
]
