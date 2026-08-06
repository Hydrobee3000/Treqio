import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useMediaQuery, useTheme } from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Languages,
  Lock,
  Palette,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/shared/lib/store'
import { AppearanceContent } from './AppearanceContent/AppearanceContent'
import { CreatorsContent } from './CreatorsContent/CreatorsContent'
import { LanguageContent } from './LanguageContent/LanguageContent'
import { PrivacyContent } from './PrivacyContent/PrivacyContent'
import styles from './SettingsPage.module.scss'

/** Раздел, открываемый по умолчанию на десктопе при заходе на /settings без раздела. */
const DEFAULT_SECTION_ID = 'appearance'

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
  icon: ReactNode
  /** Содержимое раздела. */
  content: ReactNode
  /** Прижимается к низу списка, если есть место — иначе идёт сразу за
   * остальными пунктами без дополнительного отступа. */
  pinnedToBottom?: boolean
}

/**
 * Страница настроек приложения.
 */
export function SettingsPage() {
  const { t } = useTranslation()
  const { section } = useParams<{ section: string }>()
  const navigate = useNavigate()
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const theme = useTheme()

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  useEffect(() => {
    if (!section && isDesktop) navigate(`/settings/${DEFAULT_SECTION_ID}`, { replace: true })
  }, [section, isDesktop, navigate])

  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      label: t('settings.sections.appearance.label'),
      desc: t('settings.sections.appearance.desc'),
      icon: <Palette size={18} />,
      content: <AppearanceContent />,
    },
    {
      id: 'language',
      label: t('settings.sections.language.label'),
      desc: t('settings.sections.language.desc'),
      icon: <Languages size={18} />,
      content: <LanguageContent />,
    },
    {
      id: 'privacy',
      label: t('settings.sections.privacy.label'),
      desc: t('settings.sections.privacy.desc'),
      icon: <Lock size={18} />,
      content: <PrivacyContent />,
    },
    {
      id: 'creators',
      label: t('settings.sections.creators.label'),
      desc: t('settings.sections.creators.desc'),
      icon: <UserRound size={18} />,
      content: <CreatorsContent />,
      pinnedToBottom: true,
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
              className={`${styles['settings__nav-item']} ${section === s.id ? styles['settings__nav-item--active'] : ''} ${s.pinnedToBottom ? styles['settings__nav-item--pinned'] : ''}`}
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
