import { Fragment } from 'react'
import { Tooltip } from '@mui/material'
import { BookOpen, Gamepad2, LayoutGrid, LogIn, Palette, PanelTop, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setLayout } from '@/features/layout'
import { UnderConstruction } from '@/shared/ui'
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
      icon: <Gamepad2 size={22} />,
      title: t('home.cards.addGame.title'),
      desc: t('home.cards.addGame.desc'),
      href: '/library',
      disabled: true,
    },
    {
      icon: <User size={22} />,
      title: t('home.cards.profile.title'),
      desc: t('home.cards.profile.desc'),
      href: '/profile',
    },
    {
      icon: <Palette size={22} />,
      title: t('home.cards.theme.title'),
      desc: t('home.cards.theme.desc'),
      href: '/settings/appearance',
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

      {layout === 'grid' ? (
        <div className={styles['home__grid-section']}>
          <GridLayout isGuest={isGuest} />
          <div className={styles['home__spacer']} />
          <ImportStrip />
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
function GridLayout({ isGuest }: { isGuest: boolean }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const tiles = useTiles()

  return (
    <div className={styles['grid']}>
      {tiles.map((tile) => {
        if (tile.disabled && isGuest) {
          return (
            <button
              key={tile.title}
              className={styles['grid__tile']}
              onClick={() => navigate('/login')}
            >
              <div className={styles['grid__tile-icon']}>
                <LogIn size={22} />
              </div>
              <div>
                <p className={styles['grid__tile-title']}>{t('home.cards.login.title')}</p>
                <p className={styles['grid__tile-desc']}>{t('home.cards.login.desc')}</p>
              </div>
              <span className={styles['grid__tile-arrow']}>
                <ArrowIcon />
              </span>
            </button>
          )
        }

        const button = (
          <button
            className={`${styles['grid__tile']} ${tile.disabled ? styles['grid__tile--disabled'] : ''}`}
            disabled={tile.disabled}
            onClick={() => navigate(tile.href)}
          >
            <div className={styles['grid__tile-icon']}>{tile.icon}</div>
            <div>
              <p className={styles['grid__tile-title']}>{tile.title}</p>
              <p className={styles['grid__tile-desc']}>{tile.desc}</p>
            </div>
            {!tile.disabled && (
              <span className={styles['grid__tile-arrow']}>
                <ArrowIcon />
              </span>
            )}
          </button>
        )

        return tile.disabled ? (
          <UnderConstruction key={tile.title}>{button}</UnderConstruction>
        ) : (
          <Fragment key={tile.title}>{button}</Fragment>
        )
      })}
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
  const games = tiles[1]!
  const profile = tiles[2]!
  const theme = tiles[3]!

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

      {isGuest ? (
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
      ) : (
        <UnderConstruction>
          <button
            className={`${styles['bento__cell']} ${styles['bento__cell--dark']} ${styles['bento__cell--disabled']}`}
            disabled
          >
            <div className={styles['bento__cell-icon']}>{games.icon}</div>
            <div className={styles['bento__cell-content']}>
              <p className={styles['bento__cell-title']}>{games.title}</p>
              <p className={styles['bento__cell-desc']}>{games.desc}</p>
            </div>
          </button>
        </UnderConstruction>
      )}

      <button className={styles['bento__cell']} onClick={() => navigate(profile.href)}>
        <div className={styles['bento__cell-icon']}>{profile.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{profile.title}</p>
          <p className={styles['bento__cell-desc']}>{profile.desc}</p>
        </div>
      </button>

      <button className={styles['bento__cell']} onClick={() => navigate(theme.href)}>
        <div className={styles['bento__cell-icon']}>{theme.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{theme.title}</p>
          <p className={styles['bento__cell-desc']}>{theme.desc}</p>
        </div>
      </button>

      {/* Импорт как пятая ячейка bento */}
      <UnderConstruction>
        <button className={`${styles['bento__cell']} ${styles['bento__cell--import']}`} disabled>
          <div className={styles['bento__cell-icon']}>
            <BookOpen size={22} />
          </div>
          <div className={styles['bento__cell-content']}>
            <p className={styles['bento__cell-title']}>{t('home.cards.import.bento.title')}</p>
            <p className={styles['bento__cell-desc']}>{t('home.cards.import.bento.desc')}</p>
          </div>
          <span className={styles['bento__cell-cta']}>
            <span className={styles['bento__cell-cta-text']}>
              {t('home.cards.import.bento.cta')}
            </span>
            <span className={styles['bento__cell-cta-arrow']}>
              <ArrowIcon />
            </span>
          </span>
        </button>
      </UnderConstruction>
    </div>
  )
}

/**
 * Заглушка полоски импорта из внешних сервисов.
 */
function ImportStrip() {
  const { t } = useTranslation()
  return (
    <UnderConstruction>
      <div className={styles['import-strip']}>
        <div className={styles['import-strip__left']}>
          <div className={styles['import-strip__icon']}>
            <BookOpen size={18} />
          </div>
          <div>
            <p className={styles['import-strip__title']}>{t('home.cards.import.strip.title')}</p>
            <p className={styles['import-strip__sub']}>{t('home.cards.import.strip.desc')}</p>
          </div>
        </div>
        <button className={styles['import-strip__btn']} disabled>
          <span className={styles['import-strip__btn-text']}>
            {t('home.cards.import.strip.cta')}
          </span>
          <span className={styles['import-strip__btn-arrow']}>
            <ArrowIcon />
          </span>
        </button>
      </div>
    </UnderConstruction>
  )
}
