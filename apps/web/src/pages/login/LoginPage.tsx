import { keyframes } from '@emotion/react'
import { Activity, Download, LibraryBig } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Box, Button, Tooltip, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

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
 * Плавное появление снизу — для логотипа, описания и кнопок.
 */
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

/**
 * Раскрытие текста слева направо — для лейблов фич.
 */
const revealRight = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
`

/**
 * Появление карточки — плавное проявление снизу вверх без влияния на финальную позицию.
 */
const cardFadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`

/**
 * Landing-страница для неавторизованных пользователей.
 */
export function LoginPage() {
  const { palette } = useTheme()
  const sidebar = palette.sidebar
  const isMobile = useMediaQuery('(max-width:599px)')

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  const cardsRef = useRef<HTMLDivElement>(null)
  const [cardCount, setCardCount] = useState(7)

  // Считает сколько карточек помещается по ширине контейнера и обновляет при ресайзе
  useEffect(() => {
    const CARD_W = 82
    const GAP = 14

    const calculate = () => {
      if (!cardsRef.current) return
      const W = cardsRef.current.offsetWidth
      setCardCount(Math.max(1, Math.floor((W + GAP) / (CARD_W + GAP))))
    }

    calculate()
    const ro = new ResizeObserver(calculate)
    if (cardsRef.current) ro.observe(cardsRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Верхняя секция — тёмный фон */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          bgcolor: sidebar.background,
          color: sidebar.text,
          pt: { xs: 14, md: 16 },
          pb: 0,
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {/* Логотип */}
        <Typography
          sx={{
            fontSize: { xs: 40, md: 52 },
            fontWeight: 800,
            letterSpacing: '-0.05em',
            color: sidebar.text,
            mb: 2,
            animation: `${fadeSlideUp} .6s ease both`,
          }}
        >
          Treqio
        </Typography>

        {/* Описание */}
        <Typography
          sx={{
            fontSize: { xs: 15, md: 17 },
            lineHeight: 1.6,
            color: sidebar.muted,
            maxWidth: 420,
            mb: 4,
            animation: `${fadeSlideUp} .6s ease .15s both`,
          }}
        >
          Личная библиотека книг и игр.
          <br />
          Отслеживай, ставь оценки, делись с друзьями.
        </Typography>

        {/* Кнопки */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 0, sm: 1.5 },
            flexWrap: 'wrap',
            width: { xs: '100%', sm: 'auto' },
            px: { xs: 4, sm: 0 },
            animation: `${fadeSlideUp} .6s ease .3s both`,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleLogin}
            sx={{ fontWeight: 600, px: 3.5, width: { xs: '100%', sm: 'auto' } }}
          >
            Войти через Google
          </Button>

          {/* Разделитель "или" — только мобилка */}
          {isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%',
                my: 1.5,
                color: sidebar.muted,
                fontSize: 13,
              }}
            >
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.12)' }} />
              или
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.12)' }} />
            </Box>
          )}

          <Tooltip title="Гостевой режим — скоро" placement="bottom" arrow>
            <span style={isMobile ? { width: '100%', display: 'block' } : {}}>
              <Button
                variant="outlined"
                size="large"
                disabled
                sx={{
                  px: 3.5,
                  width: { xs: '100%', sm: 'auto' },
                  borderColor: 'rgba(255,255,255,.25)',
                  color: sidebar.text,
                  '&.Mui-disabled': {
                    borderColor: 'rgba(255,255,255,.15)',
                    color: 'rgba(255,255,255,.35)',
                  },
                }}
              >
                Продолжить без входа
              </Button>
            </span>
          </Tooltip>

          {/* Хинт — только мобилка */}
          {isMobile && (
            <Typography
              sx={{
                fontSize: 12,
                color: sidebar.muted,
                mt: 1.5,
                textAlign: 'center',
              }}
            >
              Без входа данные хранятся только в браузере
            </Typography>
          )}
        </Box>

        {/* Превью карточек */}
        <Box
          ref={cardsRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: `14px`,
            width: '100%',
            px: 3,
            mt: 'auto',
            pt: 4,
            height: { xs: 85, sm: 160 },
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {Array.from(
            { length: cardCount },
            (_, i) => CARD_GRADIENTS[i % CARD_GRADIENTS.length],
          ).map((gradient, i) => {
            // Базовые вертикальные позиции для чередования уровней
            const baseY = isMobile ? (i % 2 === 0 ? 0 : 10) : i % 2 === 0 ? 6 : 18
            const hoverY = baseY - 5

            return (
              // Обёртка отвечает за вертикальную позицию и hover — анимация здесь не мешает
              <Box
                key={i}
                sx={{
                  flexShrink: 0,
                  transform: `translateY(${baseY}px)`,
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: `translateY(${hoverY}px)`,
                    '& > div': { boxShadow: '0 8px 20px rgba(0,0,0,.3)' },
                  },
                }}
              >
                {/* Карточка — только визуал и анимация проявления */}
                <Box
                  sx={{
                    width: { xs: 56, sm: 96 },
                    height: { xs: 88, sm: 140 },
                    borderRadius: '10px',
                    background: gradient,
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `${cardFadeIn} .4s ease ${0.1 + i * 0.08}s both`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '9px',
                      background: 'rgba(0,0,0,.25)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '16px',
                      left: '14px',
                      right: '14px',
                      height: '2px',
                      background: 'rgba(255,255,255,.15)',
                      borderRadius: '1px',
                    },
                  }}
                />
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Блок фич */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          bgcolor: 'rgba(250,252,249,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${palette.divider}`,
        }}
      >
        {[
          {
            icon: <LibraryBig size={18} color="#4E7B6A" />,
            label: 'Книги и игры',
            mobileLabel: 'Отмечай прочитанное и пройденное',
            text: 'Веди учёт всего что читаешь и во что играешь. Статусы, оценки, прогресс.',
          },
          {
            icon: <Activity size={18} color="#4E7B6A" />,
            label: 'Лента друзей',
            mobileLabel: 'Следи за активностью друзей',
            text: 'Следи за активностью друзей в реальном времени.',
          },
          {
            icon: <Download size={18} color="#4E7B6A" />,
            label: 'Твои данные',
            mobileLabel: 'Весь твой прогресс в одном месте',
            text: 'Вся библиотека в одном файле. Легко перенести на другое устройство.',
          },
        ].map((f, i, arr) => (
          <Box
            key={f.label}
            sx={{
              p: { xs: '10px 16px', sm: '14px 20px' },
              borderRight: { xs: 0, sm: i < arr.length - 1 ? `1px solid ${palette.divider}` : 0 },
              borderBottom: { xs: i < arr.length - 1 ? `1px solid ${palette.divider}` : 0, sm: 0 },
            }}
          >
            {/* Иконка + текст-лейбл, выезжающий прямо из иконки */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 0, sm: 1.25 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px 0 0 8px',
                  bgcolor: '#DFF0E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {f.icon}
              </Box>
              <Box
                sx={{
                  px: 1.5,
                  height: 36,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '0 8px 8px 0',
                  bgcolor: '#EBF5EF',
                  animation: `${revealRight} 1s ease 0s both`,
                }}
              >
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: '#3D6A59', whiteSpace: 'nowrap' }}
                >
                  {isMobile ? f.mobileLabel : f.label}
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontSize: 12.5,
                lineHeight: 1.55,
                color: 'text.secondary',
              }}
            >
              {f.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
