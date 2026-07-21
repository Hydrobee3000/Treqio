import type { ReactNode } from 'react'
import { Tooltip } from '@mui/material'
import styles from './SegmentedToggle.module.scss'

/**
 * Один вариант переключателя.
 */
export interface SegmentedToggleOption<T extends string> {
  /** Значение, передаваемое в onChange при выборе этого варианта. */
  value: T
  /** Иконка кнопки. */
  icon: ReactNode
  /** Текстовая подпись — если задана, кнопка становится шире (иконка + текст). */
  label?: string
  /** Подсказка при наведении. */
  tooltip?: string
}

interface Props<T extends string> {
  /** Список вариантов переключателя. */
  options: SegmentedToggleOption<T>[]
  /** Значение активного варианта. */
  value: T
  /** Колбэк при выборе варианта. */
  onChange: (value: T) => void
  /** Рамка вокруг всех кнопок. */
  bordered?: boolean
}

/**
 * Переключатель из нескольких кнопок.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  bordered = false,
}: Props<T>) {
  return (
    <div className={`${styles.toggle} ${bordered ? styles['toggle--bordered'] : ''}`}>
      {options.map((option) => {
        const button = (
          <button
            key={option.value}
            className={[
              styles.btn,
              option.label ? styles['btn--labeled'] : '',
              bordered ? styles['btn--bordered'] : '',
              value === option.value ? styles['btn--active'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {option.label && <span className={styles['btn__label']}>{option.label}</span>}
          </button>
        )

        return option.tooltip ? (
          <Tooltip key={option.value} title={option.tooltip}>
            {button}
          </Tooltip>
        ) : (
          button
        )
      })}
    </div>
  )
}
