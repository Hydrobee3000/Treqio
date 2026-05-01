import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { LibraryPage } from './LibraryPage'

// Smoke-тест: компонент рендерится без ошибок и показывает заголовок.
describe('LibraryPage', () => {
  it('renders heading', () => {
    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Моя библиотека')).toBeInTheDocument()
  })
})
