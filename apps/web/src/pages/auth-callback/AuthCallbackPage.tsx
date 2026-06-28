import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Box, CircularProgress } from '@mui/material'
import type { User } from '@/entities/user'
import { setCredentials, setUser } from '@/features/auth'
import { consumeRedirectPath } from '@/shared/lib/redirectPath'
import { useAppDispatch } from '@/shared/lib/store'

// В проде web и api на разных доменах — адрес api приходит из переменной
// окружения, инлайнится в бандл на этапе сборки. Локально переменная не
// задана, и запрос идёт через прокси Vite на относительный путь /api.
const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '/api'

/**
 * Обработчик редиректа после OAuth авторизации.
 */
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Читает accessToken из URL, загружает профиль пользователя, перенаправляет на главную
  useEffect(() => {
    const accessToken = searchParams.get('accessToken')

    if (!accessToken) {
      void navigate('/login', { replace: true })
      return
    }

    const fetchUser = async () => {
      try {
        dispatch(setCredentials({ accessToken }))

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        })

        if (res.ok) {
          const user = (await res.json()) as User
          dispatch(setUser(user))
        }
      } finally {
        void navigate(consumeRedirectPath() ?? '/', { replace: true })
      }
    }

    void fetchUser()
  }, [searchParams, dispatch, navigate])

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
    >
      <CircularProgress />
    </Box>
  )
}
