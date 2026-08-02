import { useEffect, useRef, useState } from 'react'

/** Ширина зазора между карточками (синхронизирована с gap в CSS .login-page__cards). */
const GAP = 14

/**
 * Считает, сколько карточек книг влезает по ширине контейнера, и обновляет значение при изменении размера окна/контейнера.
 */
export function useBookCardCount() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(7)

  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current) return
      const width = containerRef.current.offsetWidth
      const cardWidth = window.innerWidth < 600 ? 56 : 96
      setCount(Math.max(1, Math.floor((width + GAP) / (cardWidth + GAP))))
    }

    calculate()
    const resizeObserver = new ResizeObserver(calculate)

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  return { containerRef, count }
}
