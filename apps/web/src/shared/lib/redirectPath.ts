const REDIRECT_PATH_KEY = 'redirectPath'

/**
 * Сохраняет путь, куда нужно вернуть пользователя после входа.
 * Используется localStorage, а не location.state — между /login и /auth/callback
 * происходит полный браузерный redirect через Google, а не SPA-навигация.
 */
export function saveRedirectPath(path: string) {
  localStorage.setItem(REDIRECT_PATH_KEY, path)
}

/**
 * Возвращает сохранённый путь и удаляет его из хранилища (одноразовое использование).
 */
export function consumeRedirectPath(): string | null {
  const path = localStorage.getItem(REDIRECT_PATH_KEY)
  if (path) localStorage.removeItem(REDIRECT_PATH_KEY)
  return path
}
