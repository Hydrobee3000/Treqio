import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Palette, Settings } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setTheme } from '@/features/theme'
import { THEMES_META } from '@/shared/config/themes'
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
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      label: 'Внешний вид',
      desc: 'Тема оформления',
      icon: <Palette size={18} />,
      content: <AppearanceContent />,
    },
  ]

  const active = sections.find((s) => s.id === activeSection)

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
          {sections.map((section) => (
            <button
              key={section.id}
              className={`${styles['settings__nav-item']} ${activeSection === section.id ? styles['settings__nav-item--active'] : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className={styles['settings__nav-icon']}>{section.icon}</div>
              <div className={styles['settings__nav-info']}>
                <span className={styles['settings__nav-label']}>{section.label}</span>
                <span className={styles['settings__nav-desc']}>{section.desc}</span>
              </div>
              <ChevronRight size={16} className={styles['settings__nav-chevron']} />
            </button>
          ))}
        </nav>

        {/* Контент выбранного раздела */}
        {active && (
          <div className={styles['settings__content']}>
            <button className={styles['settings__back']} onClick={() => setActiveSection(null)}>
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

  const handleSelect = (variant: ThemeVariant) => {
    dispatch(setTheme(variant))
  }

  return (
    <div className={styles['theme-grid']}>
      {THEMES_META.map((theme) => (
        <ThemeCard
          key={theme.variant}
          theme={theme}
          isActive={theme.variant === activeVariant}
          onSelect={handleSelect}
        />
      ))}
    </div>
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
  /** Функция выбора темы. */
  onSelect: (variant: ThemeVariant) => void
}

/**
 * Карточка выбора темы с визуальным превью цветов.
 */
function ThemeCard({ theme, isActive, onSelect }: ThemeCardProps) {
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
      <div className={styles['theme-card__footer']}>{theme.name}</div>
    </button>
  )
}
