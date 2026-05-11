import { ChevronLeft, ChevronRight, Check, Palette, Settings } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setTheme } from '@/features/theme'
import { toggleParticles } from '@/features/animations'
import { THEME_COLORS, THEMES_META } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'
import styles from './SettingsPage.module.scss'

/**
 * Раздел настроек.
 */
interface SettingsSection {
  /** Идентификатор раздела. */
  id: string
  /** Название раздела. */
  label: string
  /** Краткое описание. */
  desc: string
  /** Иконка раздела. */
  icon: React.ReactNode
  /** Содержимое раздела. */
  content: React.ReactNode
}

/**
 * Страница настроек приложения.
 */
export function SettingsPage() {
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      label: 'Внешний вид',
      desc: 'Тема оформления',
      icon: <Palette size={18} />,
      content: <AppearanceContent />,
    },
  ]

  const active = sections.find((s) => s.id === section)

  return (
    <div className={styles['settings']}>
      <div className={styles['settings__header']}>
        <h1 className={styles['settings__title']}>
          Настройки
          <Settings size={28} className={styles['settings__title-icon']} />
        </h1>
      </div>

      <div className={styles['settings__body']}>
        {/* Список разделов */}
        <nav
          className={`${styles['settings__nav']} ${active ? styles['settings__nav--hidden'] : ''}`}
        >
          {sections.map((s) => (
            <button
              key={s.id}
              className={`${styles['settings__nav-item']} ${section === s.id ? styles['settings__nav-item--active'] : ''}`}
              onClick={() => navigate(`/settings/${s.id}`)}
            >
              <div className={styles['settings__nav-icon']}>{s.icon}</div>
              <div className={styles['settings__nav-info']}>
                <span className={styles['settings__nav-label']}>{s.label}</span>
                <span className={styles['settings__nav-desc']}>{s.desc}</span>
              </div>
              <ChevronRight size={16} className={styles['settings__nav-chevron']} />
            </button>
          ))}
        </nav>

        {/* Контент выбранного раздела */}
        {active && (
          <div className={styles['settings__content']}>
            <button className={styles['settings__back']} onClick={() => navigate('/settings')}>
              <ChevronLeft size={16} />
              Назад
            </button>
            <div className={styles['settings__section']}>
              <p className={styles['settings__section-title']}>{active.label}</p>
              {active.content}
            </div>
          </div>
        )}

        {/* На десктопе — показываем контент сразу при выборе из списка */}
        {!active && (
          <div
            className={`${styles['settings__content']} ${styles['settings__content--hidden']}`}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Содержимое раздела «Внешний вид».
 */
function AppearanceContent() {
  const dispatch = useAppDispatch()
  const activeVariant = useAppSelector((s) => s.theme.variant)
  const particlesEnabled = useAppSelector((s) => s.animations.particlesEnabled)
  const isDarkTheme = THEME_COLORS[activeVariant].isDark ?? false
  const hasParticles = !!THEME_COLORS[activeVariant].particle

  const handleSelect = (variant: ThemeVariant) => {
    dispatch(setTheme(variant))
  }

  return (
    <>
      <div className={styles['theme-grid']}>
        {THEMES_META.map((theme) => (
          <ThemeCard
            key={theme.variant}
            theme={theme}
            isActive={theme.variant === activeVariant}
            isDarkTheme={isDarkTheme}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {hasParticles && (
        <div className={styles['animation-row']}>
          <div className={styles['animation-row__info']}>
            <span className={styles['animation-row__label']}>Анимация</span>
            <span className={styles['animation-row__desc']}>Фоновая анимация</span>
          </div>
          <button
            className={`${styles['animation-toggle']} ${particlesEnabled ? styles['animation-toggle--on'] : ''}`}
            onClick={() => dispatch(toggleParticles())}
            aria-label={particlesEnabled ? 'Выключить анимацию' : 'Включить анимацию'}
          >
            <span className={styles['animation-toggle__thumb']} />
          </button>
        </div>
      )}
    </>
  )
}

/**
 * Свойства карточки темы.
 */
interface ThemeCardProps {
  /** Метаданные темы. */
  theme: (typeof THEMES_META)[number]
  /** Флаг активной темы. */
  isActive: boolean
  /** Флаг тёмной активной темы — используется для стилизации footer. */
  isDarkTheme: boolean
  /** Функция выбора темы. */
  onSelect: (variant: ThemeVariant) => void
}

/**
 * Карточка выбора темы с визуальным превью цветов.
 */
function ThemeCard({ theme, isActive, isDarkTheme, onSelect }: ThemeCardProps) {
  const footerStyle = isDarkTheme
    ? { background: '#1B1E25', color: isActive ? '#C97B5C' : '#E8E3DA' }
    : undefined

  return (
    <button
      className={`${styles['theme-card']} ${isActive ? styles['theme-card--active'] : ''}`}
      onClick={() => onSelect(theme.variant)}
    >
      <div className={styles['theme-card__preview']}>
        <div className={styles['theme-card__sidebar']} style={{ background: theme.sidebarColor }} />
        <div className={styles['theme-card__content']} style={{ background: theme.bgColor }}>
          <div className={styles['theme-card__dot']} style={{ background: theme.primaryColor }} />
          <div className={`${styles['theme-card__line']} ${styles['theme-card__line--wide']}`} />
          <div className={`${styles['theme-card__line']} ${styles['theme-card__line--narrow']}`} />
        </div>
        {isActive && (
          <span className={styles['theme-card__check']}>
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className={styles['theme-card__footer']} style={footerStyle}>
        {theme.name}
      </div>
    </button>
  )
}
