import { useState } from 'react'
import type { ReactNode } from 'react'
import { Info, LayoutGrid, Monitor, Moon, SlidersHorizontal, Smartphone, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toggleParticles } from '@/features/animations'
import { setDarkVariant, setLightVariant, setPair, setThemeMode } from '@/features/theme'
import type { ThemeMode } from '@/features/theme'
import { DARK_THEMES, LIGHT_THEMES, THEME_COLORS } from '@/shared/config/themes'
import type { ThemeVariant } from '@/shared/config/themes'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { SegmentedToggle } from '@/shared/ui'
import { ThemeCard } from '../ThemeCard/ThemeCard'
import styles from './AppearanceContent.module.scss'

const THEME_MODE_KEY = 'treqio_theme_picker_mode'

function getSystemIcon() {
  if (/mobile|android|iphone/i.test(navigator.userAgent)) return <Smartphone size={20} />
  return <Monitor size={20} />
}

/**
 * Содержимое раздела «Внешний вид».
 */
export function AppearanceContent() {
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
          ] as { mode: ThemeMode; icon: ReactNode; label: string }[]
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
        <SegmentedToggle
          bordered
          value={advancedMode ? 'advanced' : 'simple'}
          onChange={handleModeChange}
          options={[
            {
              value: 'simple',
              icon: <LayoutGrid size={13} />,
              label: t('settings.appearance.modeToggle.simple'),
            },
            {
              value: 'advanced',
              icon: <SlidersHorizontal size={13} />,
              label: t('settings.appearance.modeToggle.advanced'),
            },
          ]}
        />
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
