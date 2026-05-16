import { useState, useRef, useEffect } from 'react'
import { BookOpen, Gamepad2, Filter, Pencil, Check, X } from 'lucide-react'
import { useGetMeQuery, useUpdateMeMutation } from '@/features/user'
import { DISPLAY_NAME_MAX } from '@/features/user/api/constraints'
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
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [category, setCategory] = useState<Category>('books')
  const [bookStatus, setBookStatus] = useState<BookStatus>('want')
  const [gameStatus, setGameStatus] = useState<GameStatus>('want')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  if (isLoading) return null

  /** Переходит в режим редактирования имени, заполняя поле тем что сейчас отображается. */
  const handleEditName = () => {
    setNameValue(user?.displayName || user?.username || '')
    setEditingName(true)
  }

  /** Сохраняет новое displayName если оно изменилось. */
  const handleSaveName = async () => {
    const trimmed = nameValue.trim()
    const current = user?.displayName || user?.username || ''
    if (!trimmed || trimmed === current) {
      setEditingName(false)
      return
    }
    try {
      await updateMe({ displayName: trimmed }).unwrap()
      setEditingName(false)
    } catch {
      setEditingName(false)
    }
  }

  /** Отменяет редактирование без сохранения. */
  const handleCancelName = () => {
    setEditingName(false)
  }

  const statuses = category === 'books' ? BOOK_STATUSES : GAME_STATUSES
  const activeStatus = category === 'books' ? bookStatus : gameStatus

  /** Переключает активный статус в текущей категории. */
  const handleStatusChange = (id: string) => {
    if (category === 'books') setBookStatus(id as BookStatus)
    else setGameStatus(id as GameStatus)
  }

  /** Отображаемое имя — displayName если задан, иначе username, иначе дефолт. */
  const displayName = user?.displayName || user?.username || 'Мечтатель'
  /** Первая буква имени для аватара-заглушки. */
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <div className={styles['profile']}>
      <div className={styles['header']}>
        {/* Аватар + инфо */}
        <div className={styles['header__top']}>
          <div className={styles['avatar-placeholder']}>{avatarLetter}</div>
          <div className={styles['header__info']}>
            <div
              className={`${styles['name-field']} ${editingName ? styles['name-field--editing'] : ''}`}
            >
              {editingName ? (
                <>
                  <input
                    ref={nameInputRef}
                    className={styles['name-field__input']}
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    maxLength={DISPLAY_NAME_MAX}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') handleCancelName()
                    }}
                  />
                  <div className={styles['name-field__actions']}>
                    <button className={styles['name-field__btn']} onClick={handleCancelName}>
                      <X size={15} />
                    </button>
                    <button
                      className={styles['name-field__btn']}
                      onClick={handleSaveName}
                      disabled={isSaving}
                    >
                      <Check size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className={styles['header__name']}>{displayName}</h1>
                  <button className={styles['name-field__btn']} onClick={handleEditName}>
                    <Pencil size={14} />
                  </button>
                </>
              )}
              {editingName && nameValue.length >= DISPLAY_NAME_MAX - 5 && (
                <p
                  className={[
                    styles['name-counter'],
                    nameValue.length >= DISPLAY_NAME_MAX
                      ? styles['name-counter--max']
                      : styles['name-counter--warn'],
                  ].join(' ')}
                >
                  {nameValue.length}/{DISPLAY_NAME_MAX}
                </p>
              )}
            </div>
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
              onClick={() => handleStatusChange(s.id)}
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
