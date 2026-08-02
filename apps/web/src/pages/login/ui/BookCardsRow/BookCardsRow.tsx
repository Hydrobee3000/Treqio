import type { CSSProperties } from 'react'
import { useBookCardCount } from '../../lib/useBookCardCount'
import styles from './BookCardsRow.module.scss'

/**
 * Цвета градиентных карточек — имитация обложек книг и игр.
 */
const CARD_GRADIENTS = [
  'linear-gradient(145deg, #7B6FA8, #4A3E7A)',
  'linear-gradient(145deg, #5B8A7A, #2E5C50)',
  'linear-gradient(145deg, #A06040, #6B3C20)',
  'linear-gradient(145deg, #3A6FA8, #1E4A7A)',
  'linear-gradient(145deg, #8A5070, #5A2848)',
  'linear-gradient(145deg, #5A8A4A, #2E5C20)',
  'linear-gradient(145deg, #A08040, #6B5420)',
]

/** Свойства BookCardsRow. */
interface Props {
  /** Флаг мобильного экрана — влияет на вертикальное чередование карточек. */
  isMobile: boolean
}

/**
 * Анимированный ряд градиентных карточек — превью обложек книг и игр.
 */
export function BookCardsRow({ isMobile }: Props) {
  const { containerRef, count } = useBookCardCount()

  return (
    <div ref={containerRef} className={styles['login-page__cards']}>
      {Array.from({ length: count }, (_, i) => CARD_GRADIENTS[i % CARD_GRADIENTS.length]).map(
        (gradient, i) => {
          // Базовые вертикальные позиции для чередования уровней карточек книг
          const baseY = isMobile ? (i % 2 === 0 ? 0 : 10) : i % 2 === 0 ? 6 : 18

          return (
            // Обёртка отвечает за вертикальную позицию и hover
            <div
              key={i}
              className={styles['login-page__card-wrapper']}
              style={{ '--card-y': `${baseY}px` } as CSSProperties}
            >
              {/* Карточка книги */}
              <div
                className={styles['login-page__card']}
                style={{
                  background: gradient,
                  animationDelay: `${0.1 + i * 0.08}s`,
                }}
              />
            </div>
          )
        },
      )}
    </div>
  )
}
