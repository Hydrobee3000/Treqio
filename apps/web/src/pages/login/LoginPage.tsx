import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Button, useMediaQuery } from '@mui/material'
import { Activity, BarChart2, LibraryBig } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '@/shared/lib/store'
import { enterAsGuest } from '@/features/auth'
import styles from './LoginPage.module.scss'

const API_URL = import.meta.env['VITE_API_URL'] as string

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

/**
 * Фичи, отображаемые в нижней панели лендинга.
 */
const FEATURES = [
  {
    icon: <LibraryBig size={18} color="#4E7B6A" />,
    label: 'Прогресс и оценки',
    mobileLabel: 'Отмечай прогресс, ставь оценки.',
    text: 'Добавляй книги и игры, отмечай прогресс. Ставь оценки и оставляй заметки.',
  },
  {
    icon: <Activity size={18} color="#4E7B6A" />,
    label: 'Лента друзей',
    mobileLabel: 'Следи за активностью друзей.',
    text: 'Следи за активностью друзей в реальном времени.',
  },
  {
    icon: <BarChart2 size={18} color="#4E7B6A" />,
    label: 'Статистика и история',
    mobileLabel: 'Просматривай историю и статистику.',
    text: 'Просматривай историю активности и личную статистику.',
  },
]

/**
 * Landing-страница для неавторизованных пользователей.
 */
export function LoginPage() {
  const isMobile = useMediaQuery('(max-width:599px)')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  /** Вход в гостевой режим без регистрации. */
  const handleGuestLogin = () => {
    dispatch(enterAsGuest())
    navigate('/')
  }

  const cardsRef = useRef<HTMLDivElement>(null)
  const [cardCount, setCardCount] = useState(7)

  // Считает сколько карточек помещается по ширине контейнера и обновляет при ресайзе
  useEffect(() => {
    const GAP = 14

    const calculate = () => {
      if (!cardsRef.current) return
      const W = cardsRef.current.offsetWidth
      const cardW = window.innerWidth < 600 ? 56 : 96
      setCardCount(Math.max(1, Math.floor((W + GAP) / (cardW + GAP))))
    }

    calculate()
    const ro = new ResizeObserver(calculate)
    if (cardsRef.current) ro.observe(cardsRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-page__hero']}>
        <p className={styles['login-page__logo']}>Treqio</p>

        <p className={styles['login-page__description']}>
          Личная библиотека книг и игр.
          <br />
          Отслеживай, ставь оценки, делись с друзьями.
        </p>

        <div className={styles['login-page__buttons']}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleLogin}
            className={styles['login-page__google-btn']}
          >
            Войти через Google
          </Button>

          <div className={styles['login-page__or-divider']}>
            <span className={styles['login-page__or-line']} />
            или
            <span className={styles['login-page__or-line']} />
          </div>

          <span className={styles['login-page__guest-btn-wrapper']}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGuestLogin}
              className={styles['login-page__guest-btn']}
            >
              Продолжить без входа
            </Button>
          </span>

          <p className={styles['login-page__hint']}>Без входа данные хранятся только в браузере</p>
        </div>

        <div ref={cardsRef} className={styles['login-page__cards']}>
          {Array.from(
            { length: cardCount },
            (_, i) => CARD_GRADIENTS[i % CARD_GRADIENTS.length],
          ).map((gradient, i) => {
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
          })}
        </div>

        <div className={styles['login-page__features']}>
          {FEATURES.map((feature) => (
            <div key={feature.label} className={styles['login-page__feature-item']}>
              <div className={styles['login-page__feature-label-row']}>
                <div className={styles['login-page__feature-icon']}>{feature.icon}</div>
                <div className={styles['login-page__feature-label']}>
                  <span className={styles['login-page__feature-label-text']}>
                    {isMobile ? feature.mobileLabel : feature.label}
                  </span>
                </div>
              </div>
              <p className={styles['login-page__feature-description']}>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
