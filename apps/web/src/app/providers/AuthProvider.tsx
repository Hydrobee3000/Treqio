import { useEffect } from 'react'
import { useAppDispatch } from '@/shared/lib/store'
import { setCredentials, setInitialized } from '@/features/auth'

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
        const res = await fetch('/api/auth/refresh', {
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
