import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  TriangleAlert,
  Palette,
  SlidersHorizontal,
  LayoutGrid,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Info,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setPair, setLightVariant, setDarkVariant, setThemeMode } from '@/features/theme'
import type { ThemeMode } from '@/features/theme'
import { toggleParticles } from '@/features/animations'
import { THEME_COLORS, LIGHT_THEMES, DARK_THEMES } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'
import styles from './SettingsPage.module.scss'

const THEME_MODE_KEY = 'treqio_theme_picker_mode'

function getSystemIcon() {
  if (/mobile|android|iphone/i.test(navigator.userAgent)) return <Smartphone size={20} />
  return <Monitor size={20} />
}

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
  const { t } = useTranslation()
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const isGuest = useAppSelector((s) => s.auth.isGuest)

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      label: t('settings.sections.appearance.label'),
      desc: t('settings.sections.appearance.desc'),
      icon: <Palette size={18} />,
      content: <AppearanceContent />,
    },
  ]

  const active = sections.find((s) => s.id === section)

  return (
    <div className={styles['settings']}>
      <div className={styles['settings__header']}>
        <h1 className={styles['settings__title']}>
          {active ? (
            <button
              className={styles['settings__breadcrumb']}
              onClick={() => navigate('/settings')}
            >
              {t('settings.title')}
            </button>
          ) : (
            <span className={styles['settings__breadcrumb-static']}>{t('settings.title')}</span>
          )}
          {active && (
            <>
              <ChevronRight size={14} className={styles['settings__breadcrumb-sep']} />
              <span className={styles['settings__breadcrumb-current']}>{active.label}</span>
            </>
          )}
        </h1>
      </div>

      <div className={styles['settings__body']}>
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

        {active && (
          <div className={styles['settings__content']}>
            <button className={styles['settings__back']} onClick={() => navigate('/settings')}>
              <ChevronLeft size={16} />
              {t('settings.back')}
            </button>
            <div className={styles['settings__section']}>{active.content}</div>
          </div>
        )}

        {!active && (
          <div className={`${styles['settings__content']} ${styles['settings__content--hidden']}`}>
            {isGuest && (
              <div className={styles['guest-card']}>
                <div className={styles['guest-card__left']}>
                  <div className={styles['guest-card__icon']}>
                    <TriangleAlert size={18} />
                  </div>
                  <div>
                    <p className={styles['guest-card__title']}>{t('settings.guest.title')}</p>
                    <p className={styles['guest-card__sub']}>{t('settings.guest.desc')}</p>
                  </div>
                </div>
                <button className={styles['guest-card__btn']} onClick={() => navigate('/login')}>
                  {t('settings.guest.login')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Содержимое раздела «Внешний вид».
 */
function AppearanceContent() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { lightVariant, darkVariant, isDark, themeMode } = useAppSelector((s) => s.theme)
  const particlesEnabled = useAppSelector((s) => s.animations.particlesEnabled)
  const activeVariant = isDark ? darkVariant : lightVariant
  const hasParticles = !!THEME_COLORS[activeVariant].particle

  const [advancedMode, setAdvancedMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_MODE_KEY) === 'advanced'
    } catch {
      return false
    }
  })

  const handleModeChange = (mode: 'simple' | 'advanced') => {
    setAdvancedMode(mode === 'advanced')
    try {
      localStorage.setItem(THEME_MODE_KEY, mode)
    } catch {
      // ignore storage errors
    }
  }

  const handleSimpleSelect = (variant: ThemeVariant) => {
    dispatch(setPair(variant))
  }

  return (
    <>
      <p className={styles['settings-block-label']}>{t('settings.appearance.colorScheme')}</p>
      <div className={styles['theme-color-mode']}>
        {(
          [
            { mode: 'light', icon: <Sun size={20} />, label: t('settings.appearance.modes.light') },
            { mode: 'dark', icon: <Moon size={20} />, label: t('settings.appearance.modes.dark') },
            { mode: 'system', icon: getSystemIcon(), label: t('settings.appearance.modes.system') },
          ] as { mode: ThemeMode; icon: React.ReactNode; label: string }[]
        ).map(({ mode, icon, label }) => (
          <button
            key={mode}
            className={`${styles['theme-color-mode__btn']} ${themeMode === mode ? styles['theme-color-mode__btn--active'] : ''}`}
            onClick={() => dispatch(setThemeMode(mode))}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      <hr className={styles['settings-divider']} />

      <div className={styles['theme-mode-header']}>
        <span className={styles['theme-mode-label']}>
          {t('settings.appearance.themeDesign')}
          <span className={styles['info-hint']}>
            <Info size={16} />
            <span className={styles['info-hint__tooltip']}>
              {t('settings.appearance.themeInfo')}
            </span>
          </span>
        </span>
        <div className={styles['theme-mode-toggle']}>
          <button
            className={`${styles['theme-mode-btn']} ${!advancedMode ? styles['theme-mode-btn--active'] : ''}`}
            onClick={() => handleModeChange('simple')}
          >
            <LayoutGrid size={13} />
            <span className={styles['theme-mode-btn__text']}>
              {t('settings.appearance.modeToggle.simple')}
            </span>
          </button>
          <button
            className={`${styles['theme-mode-btn']} ${advancedMode ? styles['theme-mode-btn--active'] : ''}`}
            onClick={() => handleModeChange('advanced')}
          >
            <SlidersHorizontal size={13} />
            <span className={styles['theme-mode-btn__text']}>
              {t('settings.appearance.modeToggle.advanced')}
            </span>
          </button>
        </div>
      </div>

      {!advancedMode ? (
        <div className={styles['theme-grid']}>
          {LIGHT_THEMES.map((th) => (
            <ThemeCard
              key={th.variant}
              theme={th}
              isActive={th.variant === lightVariant}
              onSelect={handleSimpleSelect}
            />
          ))}
        </div>
      ) : (
        <>
          <div className={styles['theme-section']}>
            <p className={styles['theme-section__label']}>
              <Sun size={13} />
              {t('settings.appearance.lightTheme')}
            </p>
            <div className={styles['theme-grid']}>
              {LIGHT_THEMES.map((th) => (
                <ThemeCard
                  key={th.variant}
                  theme={th}
                  isActive={th.variant === lightVariant}
                  onSelect={(v) => dispatch(setLightVariant(v))}
                />
              ))}
            </div>
          </div>

          <div className={styles['theme-section']}>
            <p className={styles['theme-section__label']}>
              <Moon size={13} />
              {t('settings.appearance.darkTheme')}
            </p>
            <div className={styles['theme-grid']}>
              {DARK_THEMES.map((th) => (
                <ThemeCard
                  key={th.variant}
                  theme={th}
                  isActive={th.variant === darkVariant}
                  onSelect={(v) => dispatch(setDarkVariant(v))}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {hasParticles && (
        <>
          <hr className={styles['settings-divider']} />
          <p className={styles['settings-block-label']}>
            {t('settings.appearance.animation.title')}
          </p>
          <button
            className={styles['animation-row']}
            onClick={() => dispatch(toggleParticles())}
            aria-label={
              particlesEnabled
                ? t('settings.appearance.animation.disable')
                : t('settings.appearance.animation.enable')
            }
          >
            <span className={styles['animation-row__desc']}>
              {t('settings.appearance.animation.background')}
            </span>
            <span
              className={`${styles['animation-toggle']} ${particlesEnabled ? styles['animation-toggle--on'] : ''}`}
            >
              <span className={styles['animation-toggle__thumb']} />
            </span>
          </button>
        </>
      )}
    </>
  )
}

type ThemeMeta = (typeof LIGHT_THEMES)[number]

/**
 * Карточка выбора темы с визуальным превью цветов.
 */
function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeMeta
  isActive: boolean
  onSelect: (variant: ThemeVariant) => void
}) {
  const footerStyle = theme.isDark
    ? { background: theme.bgColor, color: isActive ? theme.primaryColor : '#E8E3DA' }
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
