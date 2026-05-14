import { useState } from 'react'
import { BookOpen, Gamepad2, Filter } from 'lucide-react'
import { useGetMeQuery } from '@/features/user'
import styles from './ProfilePage.module.scss'

type Category = 'books' | 'games'
type BookStatus = 'want' | 'reading' | 'done' | 'dropped'
type GameStatus = 'want' | 'playing' | 'done' | 'dropped'

const BOOK_STATUSES: { id: BookStatus; label: string }[] = [
  { id: 'want', label: 'Хочу читать' },
  { id: 'reading', label: 'Читаю' },
  { id: 'done', label: 'Прочитал' },
  { id: 'dropped', label: 'Брошено' },
]

const GAME_STATUSES: { id: GameStatus; label: string }[] = [
  { id: 'want', label: 'Хочу пройти' },
  { id: 'playing', label: 'Играю' },
  { id: 'done', label: 'Прошёл' },
  { id: 'dropped', label: 'Брошено' },
]

/**
 * Страница профиля пользователя.
 */
export const ProfilePage = () => {
  const { data: user, isLoading } = useGetMeQuery()
  const [category, setCategory] = useState<Category>('books')
  const [bookStatus, setBookStatus] = useState<BookStatus>('want')
  const [gameStatus, setGameStatus] = useState<GameStatus>('want')

  if (isLoading) return null

  const statuses = category === 'books' ? BOOK_STATUSES : GAME_STATUSES
  const activeStatus = category === 'books' ? bookStatus : gameStatus
  const setStatus =
    category === 'books'
      ? (s: string) => setBookStatus(s as BookStatus)
      : (s: string) => setGameStatus(s as GameStatus)

  const rawName = user?.username || user?.displayName || 'Мечтатель'
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <div className={styles['profile']}>
      <div className={styles['header']}>
        {/* Аватар + инфо */}
        <div className={styles['header__top']}>
          <div className={styles['avatar-placeholder']}>{avatarLetter}</div>
          <div className={styles['header__info']}>
            <h1 className={styles['header__name']}>{displayName}</h1>
            <div className={styles['header__meta']}>
              {user?.username && <span>@{user.username}</span>}
            </div>
            {user?.bio && <p className={styles['header__bio']}>{user.bio}</p>}
          </div>
        </div>

        {/* Табы категорий */}
        <div className={styles['category-tabs']}>
          <button
            className={`${styles['category-tab']} ${category === 'books' ? styles['category-tab--active'] : ''}`}
            onClick={() => setCategory('books')}
          >
            <BookOpen size={15} />
            Книги
          </button>
          <button
            className={`${styles['category-tab']} ${category === 'games' ? styles['category-tab--active'] : ''}`}
            onClick={() => setCategory('games')}
          >
            <Gamepad2 size={15} />
            Игры
          </button>
        </div>

        {/* Строка статистики */}
        <div className={styles['stats-row']}>
          {statuses.map((s) => (
            <button
              key={s.id}
              className={`${styles['stat']} ${activeStatus === s.id ? styles['stat--active'] : ''}`}
              onClick={() => setStatus(s.id)}
            >
              <span className={styles['stat__value']}>0</span>
              <span className={styles['stat__label']}>{s.label}</span>
            </button>
          ))}
          <div className={styles['stats-row__actions']}>
            <button className={styles['icon-btn']}>
              <Filter size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Сетка — пустое состояние */}
      <div className={styles['grid-section']}>
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            {category === 'books' ? <BookOpen size={48} /> : <Gamepad2 size={48} />}
          </div>
          <p className={styles['empty-state__text']}>
            {category === 'books' ? 'Список книг пуст' : 'Список игр пуст'}
          </p>
          <p className={styles['empty-state__sub']}>
            Добавь первую {category === 'books' ? 'книгу' : 'игру'} в свою библиотеку
          </p>
        </div>
      </div>
    </div>
  )
}
