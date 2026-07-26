/**
 * Никнеймы, недоступные для занятия пользователями.
 *
 * Профиль открывается по адресу вида `/:username`, поэтому такой никнейм
 * перехватывал бы существующий или планируемый маршрут приложения.
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
