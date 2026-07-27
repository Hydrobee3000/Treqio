import { useEffect, useState } from 'react'

/**
 * Возвращает значение с задержкой — обновляется, когда исходное перестаёт
 * меняться дольше указанного времени.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
