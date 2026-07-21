import { Tooltip } from '@mui/material'
import { BookOpen, Languages, LayoutGrid, LogIn, Palette, PanelTop, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setLayout } from '@/features/layout'
import type { LayoutVariant } from '@/shared/config/layout'
import styles from './HomePage.module.scss'

/**
 * Плитки быстрых действий — зависят от переводов.
 */
function useTiles() {
  const { t } = useTranslation()
  return [
    {
      icon: <BookOpen size={22} />,
      title: t('home.cards.addBook.title'),
      desc: t('home.cards.addBook.desc'),
      href: '/library',
    },
    {
      icon: <Palette size={22} />,
      title: t('home.cards.theme.title'),
      desc: t('home.cards.theme.desc'),
      href: '/settings/appearance',
    },
    {
      icon: <User size={22} />,
      title: t('home.cards.profile.title'),
      desc: t('home.cards.profile.desc'),
      href: '/profile',
    },
    {
      icon: <Languages size={22} />,
      title: t('home.cards.language.title'),
      desc: t('home.cards.language.desc'),
      href: '/settings/language',
    },
  ]
}

/**
 * Иконка стрелки для плитки.
 */
function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

/**
 * Домашняя страница — точка входа для авторизованного пользователя.
 */
export function HomePage() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((s) => s.layout.variant)
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const { t } = useTranslation()

  const handleLayoutChange = (variant: LayoutVariant) => {
    dispatch(setLayout(variant))
  }

  return (
    <div className={styles['home']}>
      <div className={styles['home__header']}>
        <h1 className={styles['home__title']}>{t('home.title')}</h1>
      </div>

      <div className={styles['home__label-row']}>
        <span className={styles['home__label']}>{t('home.quickActions')}</span>

        <div className={styles['home__label-row-end']}>
          <span className={styles['home__version']}>v{__APP_VERSION__}</span>

          {/* Переключатель вида */}
          <div className={styles['home__layout-toggle']}>
            <Tooltip title={t('home.layoutGrid')}>
              <button
                className={`${styles['home__layout-btn']} ${layout === 'grid' ? styles['home__layout-btn--active'] : ''}`}
                onClick={() => handleLayoutChange('grid')}
              >
                <LayoutGrid size={16} />
              </button>
            </Tooltip>
            <Tooltip title={t('home.layoutBento')}>
              <button
                className={`${styles['home__layout-btn']} ${layout === 'bento' ? styles['home__layout-btn--active'] : ''}`}
                onClick={() => handleLayoutChange('bento')}
              >
                <PanelTop size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {layout === 'grid' ? (
        <div className={styles['home__grid-section']}>
          <GridLayout />
          <div className={styles['home__spacer']} />
          {isGuest && <LoginStrip />}
        </div>
      ) : (
        <BentoLayout isGuest={isGuest} />
      )}
    </div>
  )
}

/**
 * Сетка 2×2.
 */
function GridLayout() {
  const navigate = useNavigate()
  const tiles = useTiles()

  return (
    <div className={styles['grid']}>
      {tiles.map((tile) => (
        <button
          key={tile.title}
          className={styles['grid__tile']}
          onClick={() => navigate(tile.href)}
        >
          <div className={styles['grid__tile-icon']}>{tile.icon}</div>
          <div>
            <p className={styles['grid__tile-title']}>{tile.title}</p>
            <p className={styles['grid__tile-desc']}>{tile.desc}</p>
          </div>
          <span className={styles['grid__tile-arrow']}>
            <ArrowIcon />
          </span>
        </button>
      ))}
    </div>
  )
}

/**
 * Bento-раскладка.
 */
function BentoLayout({ isGuest }: { isGuest: boolean }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const tiles = useTiles()
  const books = tiles[0]!
  const theme = tiles[1]!
  const profile = tiles[2]!
  const language = tiles[3]!

  return (
    <div className={styles['bento']}>
      <button
        className={`${styles['bento__cell']} ${styles['bento__cell--hero']}`}
        onClick={() => navigate(books.href)}
      >
        <div className={styles['bento__cell-icon']}>{books.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{books.title}</p>
          <p className={styles['bento__cell-desc']}>{books.desc}</p>
        </div>
      </button>

      <button
        className={`${styles['bento__cell']} ${styles['bento__cell--dark']}`}
        onClick={() => navigate(theme.href)}
      >
        <div className={styles['bento__cell-icon']}>{theme.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{theme.title}</p>
          <p className={styles['bento__cell-desc']}>{theme.desc}</p>
        </div>
      </button>

      <button className={styles['bento__cell']} onClick={() => navigate(profile.href)}>
        <div className={styles['bento__cell-icon']}>{profile.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{profile.title}</p>
          <p className={styles['bento__cell-desc']}>{profile.desc}</p>
        </div>
      </button>

      <button className={styles['bento__cell']} onClick={() => navigate(language.href)}>
        <div className={styles['bento__cell-icon']}>{language.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{language.title}</p>
          <p className={styles['bento__cell-desc']}>{language.desc}</p>
        </div>
      </button>

      {/* Гостю в пятой ячейке bento предлагаем войти */}
      {isGuest && (
        <button
          className={`${styles['bento__cell']} ${styles['bento__cell--dark']}`}
          onClick={() => navigate('/login')}
        >
          <div className={styles['bento__cell-icon']}>
            <LogIn size={22} />
          </div>
          <div className={styles['bento__cell-content']}>
            <p className={styles['bento__cell-title']}>{t('home.cards.login.title')}</p>
            <p className={styles['bento__cell-desc']}>{t('home.cards.login.desc')}</p>
          </div>
        </button>
      )}
    </div>
  )
}

/**
 * Полоска-приглашение войти — показывается гостю внизу сетки быстрых действий.
 */
function LoginStrip() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <button className={styles['login-strip']} onClick={() => navigate('/login')}>
      <div className={styles['login-strip__left']}>
        <div className={styles['login-strip__icon']}>
          <LogIn size={18} />
        </div>
        <div>
          <p className={styles['login-strip__title']}>{t('home.cards.login.title')}</p>
          <p className={styles['login-strip__sub']}>{t('home.cards.login.desc')}</p>
        </div>
      </div>
      <span className={styles['login-strip__arrow']}>
        <ArrowIcon />
      </span>
    </button>
  )
}
