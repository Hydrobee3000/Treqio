import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth'
import { baseApi } from '@/shared/api/baseApi'
import { I18nProvider } from '@/app/providers/I18nProvider'
import i18n from '@/shared/lib/i18n'
import { LibraryPage } from './LibraryPage'

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (m) => m().concat(baseApi.middleware),
  })

beforeAll(async () => {
  await i18n.changeLanguage('ru')
})

// Smoke-тест: компонент рендерится без ошибок и показывает заголовок.
describe('LibraryPage', () => {
  it('renders heading', async () => {
    render(
      <I18nProvider>
        <Provider store={makeStore()}>
          <MemoryRouter>
            <LibraryPage />
          </MemoryRouter>
        </Provider>
      </I18nProvider>,
    )

    // useGetMyEntriesQuery резолвится асинхронно даже для гостя без токена,
    // поэтому ждём пока компонент выйдет из состояния загрузки.
    await waitFor(() => {
      expect(screen.getByText('Моя библиотека')).toBeInTheDocument()
    })
  })
})
