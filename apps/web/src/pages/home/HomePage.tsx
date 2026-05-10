import { BookOpen, Gamepad2, LayoutGrid, Palette, PanelTop, User } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setLayout } from '@/app/store/layoutSlice'
import type { LayoutVariant } from '@/app/store/layoutSlice'
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
    href: '/settings',
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
  return (
    <div className={styles['grid']}>
      {TILES.map((tile) => (
        <button key={tile.title} className={styles['grid__tile']}>
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
  const [books, games, profile, theme] = TILES

  return (
    <div className={styles['bento']}>
      <button className={`${styles['bento__cell']} ${styles['bento__cell--hero']}`}>
        <div className={styles['bento__cell-icon']}>{books.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{books.title}</p>
          <p className={styles['bento__cell-desc']}>{books.desc}</p>
        </div>
      </button>

      <button className={`${styles['bento__cell']} ${styles['bento__cell--dark']}`}>
        <div className={styles['bento__cell-icon']}>{games.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{games.title}</p>
          <p className={styles['bento__cell-desc']}>{games.desc}</p>
        </div>
      </button>

      <button className={styles['bento__cell']}>
        <div className={styles['bento__cell-icon']}>{profile.icon}</div>
        <div className={styles['bento__cell-content']}>
          <p className={styles['bento__cell-title']}>{profile.title}</p>
          <p className={styles['bento__cell-desc']}>{profile.desc}</p>
        </div>
      </button>

      <button className={styles['bento__cell']}>
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
          <ArrowIcon />
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
        <ArrowIcon />
      </button>
    </div>
  )
}
