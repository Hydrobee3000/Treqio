import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * Результат хука useBackdropClose.
 */
interface UseBackdropCloseResult {
  /** Ref, который нужно навесить на DOM-элемент backdrop. */
  backdropRef: RefObject<HTMLDivElement | null>
  /** Проверяет, начался ли текущий клик именно на backdrop — вызывать внутри onClick перед закрытием. */
  isBackdropClick: () => boolean
}

/**
 * Отслеживает, начался ли mousedown на backdrop — без этого выделение текста
 * мышью с отпусканием за пределами модалки закрывало бы её как клик по фону.
 */
export function useBackdropClose(active: boolean): UseBackdropCloseResult {
  const backdropRef = useRef<HTMLDivElement>(null)
  const mouseDownOnBackdropRef = useRef(false)

  useEffect(() => {
    if (!active) return

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownOnBackdropRef.current = e.target === backdropRef.current
    }
    document.addEventListener('mousedown', handleMouseDown, true)
    return () => document.removeEventListener('mousedown', handleMouseDown, true)
  }, [active])

  return {
    backdropRef,
    isBackdropClick: () => mouseDownOnBackdropRef.current,
  }
}
