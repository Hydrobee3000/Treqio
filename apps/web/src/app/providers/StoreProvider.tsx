// Провайдер Redux store — делает store доступным всем компонентам ниже по дереву.
// Должен оборачивать всё приложение, в идеале — снаружи ThemeProvider,
// чтобы и UI-компоненты тоже имели доступ к store если понадобится.
import { Provider } from 'react-redux'
import type { ReactNode } from 'react'
import { store } from '../store'

interface Props {
  children: ReactNode
}

export const StoreProvider = ({ children }: Props) => (
  <Provider store={store}>{children}</Provider>
)
