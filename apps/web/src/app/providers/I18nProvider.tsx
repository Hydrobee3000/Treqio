import { I18nextProvider } from 'react-i18next'
import type { ReactNode } from 'react'
import i18n from '@/shared/lib/i18n'

/**
 * Пропсы провайдера интернационализации.
 */
interface Props {
  /** Дочерние компоненты с доступом к переводам. */
  children: ReactNode
}

/**
 * Оборачивает приложение i18next-провайдером.
 */
export const I18nProvider = ({ children }: Props) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
