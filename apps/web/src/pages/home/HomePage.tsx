import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  Languages,
  LayoutGrid,
  LogIn,
  Palette,
  PanelTop,
  User,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setLayout } from '@/features/layout'
import type { LayoutVariant } from '@/shared/config/layout'
import { SegmentedToggle } from '@/shared/ui'
import styles from './HomePage.module.scss'

/** Идентификатор плитки. */
type TileKey = 'books' | 'theme' | 'profile' | 'language'

/**
 * Плитка быстрого действия на домашней странице.
 */
interface Tile {
  /** Стабильный идентификатор — используется вместо индекса массива. */
  key: TileKey
  /** Иконка плитки. */
  icon: ReactNode
  /** Заголовок плитки. */
  title: string
  /** Описание плитки. */
  desc: string
  /** Путь для перехода при клике. */
  href: string
}

/**
 * Плитки быстрых действий — зависят от переводов.
 */
function useTiles(): Tile[] {
  const { t } = useTranslation()
  return [
    {
      key: 'books',
      icon: <BookOpen size={22} />,
      title: t('home.cards.addBook.title'),
      desc: t('home.cards.addBook.desc'),
      href: '/library',
    },
    {
      key: 'theme',
      icon: <Palette size={22} />,
      title: t('home.cards.theme.title'),
      desc: t('home.cards.theme.desc'),
      href: '/settings/appearance',
    },
    {
      key: 'profile',
      icon: <User size={22} />,
      title: t('home.cards.profile.title'),
      desc: t('home.cards.profile.desc'),
      href: '/profile',
    },
    {
      key: 'language',
      icon: <Languages size={22} />,
      title: t('home.cards.language.title'),
      desc: t('home.cards.language.desc'),
      href: '/settings/language',
    },
  ]
}

/** Свойства кнопки-плитки. */
interface TileButtonProps {
  /** Иконка плитки. */
  icon: ReactNode
  /** Заголовок плитки. */
  title: string
  /** Описание плитки. */
  desc: string
  /** Колбэк клика по плитке. */
  onClick: () => void
}

/**
 * Кнопка-плитка для сетки 2×2 — иконка, заголовок с описанием и стрелка.
 */
function GridTileButton({ icon, title, desc, onClick }: TileButtonProps) {
  return (
    <button className={styles['grid__tile']} onClick={onClick}>
      <div className={styles['grid__tile-icon']}>{icon}</div>
      <div>
        <p className={styles['grid__tile-title']}>{title}</p>
        <p className={styles['grid__tile-desc']}>{desc}</p>
      </div>
      <span className={styles['grid__tile-arrow']}>
        <ArrowRight size={16} strokeWidth={2} />
      </span>
    </button>
  )
}

/**
 * Кнопка-ячейка для bento-раскладки — иконка и заголовок с описанием.
 */
function BentoCellButton({
  icon,
  title,
  desc,
  onClick,
  variant,
}: TileButtonProps & { variant?: 'hero' | 'dark' }) {
  return (
    <button
      className={`${styles['bento__cell']} ${variant ? styles[`bento__cell--${variant}`] : ''}`}
      onClick={onClick}
    >
      <div className={styles['bento__cell-icon']}>{icon}</div>
      <div className={styles['bento__cell-content']}>
        <p className={styles['bento__cell-title']}>{title}</p>
        <p className={styles['bento__cell-desc']}>{desc}</p>
      </div>
    </button>
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
          <SegmentedToggle
            value={layout}
            onChange={handleLayoutChange}
            options={[
              { value: 'grid', icon: <LayoutGrid size={16} />, tooltip: t('home.layoutGrid') },
              { value: 'bento', icon: <PanelTop size={16} />, tooltip: t('home.layoutBento') },
            ]}
          />
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
        <GridTileButton
          key={tile.key}
          icon={tile.icon}
          title={tile.title}
          desc={tile.desc}
          onClick={() => navigate(tile.href)}
        />
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
  const getTile = (key: TileKey) => tiles.find((tile) => tile.key === key)!
  const books = getTile('books')
  const theme = getTile('theme')
  const profile = getTile('profile')
  const language = getTile('language')

  return (
    <div className={styles['bento']}>
      <BentoCellButton
        variant="hero"
        icon={books.icon}
        title={books.title}
        desc={books.desc}
        onClick={() => navigate(books.href)}
      />

      <BentoCellButton
        variant="dark"
        icon={theme.icon}
        title={theme.title}
        desc={theme.desc}
        onClick={() => navigate(theme.href)}
      />

      <BentoCellButton
        icon={profile.icon}
        title={profile.title}
        desc={profile.desc}
        onClick={() => navigate(profile.href)}
      />

      <BentoCellButton
        icon={language.icon}
        title={language.title}
        desc={language.desc}
        onClick={() => navigate(language.href)}
      />

      {/* Гостю в пятой ячейке bento предлагаем войти */}
      {isGuest && (
        <BentoCellButton
          variant="dark"
          icon={<LogIn size={22} />}
          title={t('home.cards.login.title')}
          desc={t('home.cards.login.desc')}
          onClick={() => navigate('/login')}
        />
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
        <ArrowRight size={16} strokeWidth={2} />
      </span>
    </button>
  )
}
