import { Provider } from 'react-redux'
import type { ReactNode } from 'react'
import { store } from '../store'

interface Props {
  /**
   * Дерево компонентов с доступом к Redux store
   */
  children: ReactNode
}

/**
 * Оборачивает приложение Redux Provider'ом
 */
export const StoreProvider = ({ children }: Props) => (
  <Provider store={store}>{children}</Provider>
)
