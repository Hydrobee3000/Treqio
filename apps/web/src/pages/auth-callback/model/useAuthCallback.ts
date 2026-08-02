import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { setCredentials } from '@/features/auth'
import { consumeRedirectPath } from '@/shared/lib/redirectPath'
import { useAppDispatch } from '@/shared/lib/store'

/**
 * Читает accessToken из query-параметров после OAuth-редиректа, сохраняет
 * его в сторе и уводит на сохранённый путь (или на главную).
 */
export function useAuthCallback() {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')

    if (!accessToken) {
      void navigate('/login', { replace: true })
      return
    }

    dispatch(setCredentials({ accessToken }))
    void navigate(consumeRedirectPath() ?? '/', { replace: true })
  }, [searchParams, dispatch, navigate])
}
