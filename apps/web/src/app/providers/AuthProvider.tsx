import { useEffect } from 'react'
import { useAppDispatch } from '@/shared/lib/store'
import { setCredentials, setInitialized } from '@/features/auth'

// В проде web и api на разных доменах — адрес api приходит из переменной
// окружения, инлайнится в бандл на этапе сборки. Локально переменная не
// задана, и запрос идёт через прокси Vite на относительный путь /api.
const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '/api'

/**
 * Пропсы провайдера авторизации.
 */
interface Props {
  /** Дочерние компоненты приложения. */
  children: React.ReactNode
}

/**
 * Восстановление сессии при старте приложения через refresh token cookie.
 */
export function AuthProvider({ children }: Props) {
  const dispatch = useAppDispatch()

  // При монтировании пробуем получить новый access token по refresh token из cookie.
  // Если cookie валиден — пользователь восстанавливает сессию без повторного логина.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (res.ok) {
          const { accessToken } = (await res.json()) as { accessToken: string }
          dispatch(setCredentials({ accessToken }))
        }
      } finally {
        // Помечаем инициализацию завершённой в любом случае — даже если refresh не прошёл
        dispatch(setInitialized())
      }
    }

    void restoreSession()
  }, [dispatch])

  return <>{children}</>
}
