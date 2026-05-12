import { BookOpen, Gamepad2, LayoutGrid, Palette, PanelTop, User } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setLayout } from '@/features/layout'
import type { LayoutVariant } from '@/shared/config/layout'
import styles from './HomePage.module.scss'

/**
 * Плитки быстрых действий.
 */
const TILES = [
  {
    icon: <BookOpen size={22} />,
    title: 'Найти книгу',
    desc: 'Добавить в список, отметить прочитанной, поставить оценку.',
    href: '/library',
  },
  {
    icon: <Gamepad2 size={22} />,
    title: 'Найти игру',
    desc: 'Добавить в список, отметить пройденной, поставить оценку.',
    href: '/library',
  },
  {
    icon: <User size={22} />,
    title: 'Настроить профиль',
    desc: 'Имя, аватар, видимость и приватность.',
    href: '/profile',
  },
  {
    icon: <Palette size={22} />,
    title: 'Настроить тему',
    desc: 'Цветовая палитра и шрифт интерфейса.',
    href: '/settings/appearance',
  },
]

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

  const handleLayoutChange = (variant: LayoutVariant) => {
    dispatch(setLayout(variant))
  }

  return (
    <div className={styles['home']}>
      <div className={styles['home__header']}>
        <h1 className={styles['home__title']}>Чем сегодня займёмся?</h1>
      </div>

      <div className={styles['home__label-row']}>
        <span className={styles['home__label']}>Быстрые действия</span>

        {/* Переключатель вида */}
        <div className={styles['home__layout-toggle']}>
          <button
            className={`${styles['home__layout-btn']} ${layout === 'grid' ? styles['home__layout-btn--active'] : ''}`}
            onClick={() => handleLayoutChange('grid')}
            title="Сетка"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`${styles['home__layout-btn']} ${layout === 'bento' ? styles['home__layout-btn--active'] : ''}`}
            onClick={() => handleLayoutChange('bento')}
            title="Bento"
          >
            <PanelTop size={16} />
          </button>
        </div>
      </div>

      {layout === 'grid' ? (
        <div className={styles['home__grid-section']}>
          <GridLayout />
          <div className={styles['home__spacer']} />
          <ImportStrip />
        </div>
      ) : (
        <BentoLayout />
      )}
    </div>
  )
}

/**
 * Сетка 2×2.
 */
function GridLayout() {
  const navigate = useNavigate()

  return (
    <div className={styles['grid']}>
      {TILES.map((tile) => (
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
function BentoLayout() {
  const navigate = useNavigate()
  const books = TILES[0]!
  const games = TILES[1]!
  const profile = TILES[2]!
  const theme = TILES[3]!

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
        onClick={() => navigate(games.href)}
      >
        <div className={styles['bento__cell-icon']}>{games.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{games.title}</p>
          <p className={styles['bento__cell-desc']}>{games.desc}</p>
        </div>
      </button>

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
      <button className={`${styles['bento__cell']} ${styles['bento__cell--import']}`} disabled>
        <div className={styles['bento__cell-icon']}>
          <BookOpen size={22} />
        </div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>Импорт</p>
          <p className={styles['bento__cell-desc']}>Goodreads, HLTB — скоро</p>
        </div>
        <span className={styles['bento__cell-cta']}>
          <span className={styles['bento__cell-cta-text']}>Подключить</span>
          <span className={styles['bento__cell-cta-arrow']}>
            <ArrowIcon />
          </span>
        </span>
      </button>
    </div>
  )
}

/**
 * Заглушка полоски импорта из внешних сервисов.
 */
function ImportStrip() {
  return (
    <div className={styles['import-strip']}>
      <div className={styles['import-strip__left']}>
        <div className={styles['import-strip__icon']}>
          <BookOpen size={18} />
        </div>
        <div>
          <p className={styles['import-strip__title']}>Импортировать списки</p>
          <p className={styles['import-strip__sub']}>Goodreads, HLTB — скоро</p>
        </div>
      </div>
      <button className={styles['import-strip__btn']} disabled>
        <span className={styles['import-strip__btn-text']}>Подключить</span>
        <span className={styles['import-strip__btn-arrow']}>
          <ArrowIcon />
        </span>
      </button>
    </div>
  )
}
