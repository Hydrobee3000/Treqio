import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Button, useMediaQuery } from '@mui/material'
import { Activity, BarChart2, LibraryBig } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
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
 * Иконки для фич лендинга.
 */
const FEATURE_ICONS = [
  <LibraryBig key="progress" size={18} color="#4E7B6A" />,
  <Activity key="feed" size={18} color="#4E7B6A" />,
  <BarChart2 key="stats" size={18} color="#4E7B6A" />,
]

/**
 * Ключи фич для получения переводов.
 */
const FEATURE_KEYS = ['progress', 'feed', 'stats'] as const

/**
 * Landing-страница для неавторизованных пользователей.
 */
export function LoginPage() {
  const { t } = useTranslation()
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
          {t('login.description')}
          <br />
          {t('login.additionalDescription')}
        </p>

        <div className={styles['login-page__buttons']}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleLogin}
            className={styles['login-page__google-btn']}
          >
            {t('login.googleLogin')}
          </Button>

          <div className={styles['login-page__or-divider']}>
            <span className={styles['login-page__or-line']} />
            {t('login.or')}
            <span className={styles['login-page__or-line']} />
          </div>

          <span className={styles['login-page__guest-btn-wrapper']}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleGuestLogin}
              className={styles['login-page__guest-btn']}
            >
              {t('login.guestLogin')}
            </Button>
          </span>

          <p className={styles['login-page__hint']}>{t('login.guestHint')}</p>
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
          {FEATURE_KEYS.map((key, i) => (
            <div key={key} className={styles['login-page__feature-item']}>
              <div className={styles['login-page__feature-label-row']}>
                <div className={styles['login-page__feature-icon']}>{FEATURE_ICONS[i]}</div>
                <div className={styles['login-page__feature-label']}>
                  <span className={styles['login-page__feature-label-text']}>
                    {isMobile
                      ? t(`login.features.${key}.mobileLabel`)
                      : t(`login.features.${key}.label`)}
                  </span>
                </div>
              </div>
              <p className={styles['login-page__feature-description']}>
                {t(`login.features.${key}.text`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
