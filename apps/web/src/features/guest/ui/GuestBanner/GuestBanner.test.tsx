import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth'
import { guestReducer } from '@/features/guest'
import { themeReducer } from '@/features/theme'
import { layoutReducer } from '@/features/layout'
import { animationsReducer } from '@/features/animations'
import { baseApi } from '@/shared/api/baseApi'
import { GuestBanner } from './GuestBanner'

/**
 * Тестовый store с управляемым начальным состоянием.
 * preloadedState переопределяет инициализацию authSlice из localStorage.
 */
const makeStore = (isGuest: boolean) =>
  configureStore({
    reducer: {
      auth: authReducer,
      guest: guestReducer,
      theme: themeReducer,
      layout: layoutReducer,
      animations: animationsReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (m) => m().concat(baseApi.middleware),
    preloadedState: {
      auth: {
        user: null,
        accessToken: null,
        isInitialized: true,
        isGuest,
      },
    },
  })

/**
 * Рендер GuestBanner с необходимыми провайдерами.
 * Provider даёт компоненту доступ к store, MemoryRouter — к useNavigate.
 */
const renderBanner = (isGuest: boolean) =>
  render(
    <Provider store={makeStore(isGuest)}>
      <MemoryRouter>
        <GuestBanner />
      </MemoryRouter>
    </Provider>,
  )

describe('GuestBanner', () => {
  // GuestBanner читает localStorage при монтировании — очищаем между тестами
  beforeEach(() => {
    localStorage.clear()
  })

  it('показывает баннер если пользователь является гостем', () => {
    renderBanner(true)
    expect(screen.getByText('Данные хранятся только в браузере')).toBeInTheDocument()
    expect(screen.getByText('Войти')).toBeInTheDocument()
  })

  it('не показывает баннер для авторизованного пользователя', () => {
    renderBanner(false)
    // queryByText возвращает null если элемент не найден
    expect(screen.queryByText('Данные хранятся только в браузере')).not.toBeInTheDocument()
  })

  it('скрывает баннер и сохраняет флаг в localStorage при нажатии крестика', async () => {
    renderBanner(true)
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

    // Snackbar удаляет содержимое из DOM после анимации закрытия — ждём завершения
    await waitFor(() => {
      expect(screen.queryByText('Данные хранятся только в браузере')).not.toBeInTheDocument()
    })

    expect(localStorage.getItem('treqio_guest_banner_dismissed')).toBe('true')
  })
})
