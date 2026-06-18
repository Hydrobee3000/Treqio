import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth'
import { baseApi } from '@/shared/api/baseApi'
import { LibraryPage } from './LibraryPage'

const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (m) => m().concat(baseApi.middleware),
  })

// Smoke-тест: компонент рендерится без ошибок и показывает заголовок.
describe('LibraryPage', () => {
  it('renders heading', async () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <LibraryPage />
        </MemoryRouter>
      </Provider>,
    )

    // useGetMyEntriesQuery резолвится асинхронно даже для гостя без токена,
    // поэтому ждём пока компонент выйдет из состояния загрузки.
    await waitFor(() => {
      expect(screen.getByText('Моя библиотека')).toBeInTheDocument()
    })
  })
})
