import { useState, useRef, useEffect } from 'react'
import { BookOpen, Filter, Pencil, Check, X, LogIn, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { STATUS_LABEL } from '@/entities/book'
import type { BookStatus } from '@/entities/book'
import { useGetMeQuery, useUpdateMeMutation, useLogoutMutation } from '@/features/user'
import { DISPLAY_NAME_MAX } from '@/features/user/api/constraints'
import { setGuestDisplayName } from '@/features/guest'
import { logout } from '@/features/auth'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import styles from './ProfilePage.module.scss'

const DEFAULT_DISPLAY_NAME = 'Мечтатель'

/** Табы статусов в строке статистики. */
const STATUS_TABS: { value: BookStatus; label: string }[] = Object.entries(STATUS_LABEL).map(
  ([value, label]) => ({ value: value as BookStatus, label }),
)

/**
 * Страница профиля пользователя.
 */
export const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const guestDisplayName = useAppSelector((s) => s.guest.displayName)
  const { data: user, isLoading } = useGetMeQuery(undefined, { skip: isGuest })
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation()
  const [logoutMutation] = useLogoutMutation()

  /**
   * Функция выхода из аккаунта.
   */
  const handleLogout = async () => {
    await logoutMutation()
    dispatch(logout())
    navigate('/login')
  }
  const [statusFilter, setStatusFilter] = useState<BookStatus>('WANT')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  /**
   * Фокусировка поля ввода при открытии редактора имени.
   */
  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  if (isLoading) return null

  /**
   * Функция редактирования имени пользователя.
   */
  const handleEditName = () => {
    const current = isGuest
      ? guestDisplayName || DEFAULT_DISPLAY_NAME
      : user?.displayName || user?.username || ''
    setNameValue(current)
    setEditingName(true)
  }

  /**
   * Функция сохранения имени пользователя.
   */
  const handleSaveName = async () => {
    const trimmed = nameValue.trim()
    const current = isGuest
      ? guestDisplayName || DEFAULT_DISPLAY_NAME
      : user?.displayName || user?.username || ''
    // Если пустое значение или имя не изменилось
    if (!trimmed || trimmed === current) {
      setEditingName(false)
      return
    }
    // Если гость - сохраняем локально без запроса к API
    if (isGuest) {
      dispatch(setGuestDisplayName(trimmed))
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

  /**
   * Функция отмены редактирования имени.
   */
  const handleCancelName = () => {
    setEditingName(false)
  }

  const displayName = isGuest
    ? guestDisplayName || DEFAULT_DISPLAY_NAME
    : user?.displayName || user?.username || DEFAULT_DISPLAY_NAME
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
          <button
            className={styles['header__auth-btn']}
            onClick={isGuest ? () => navigate('/login') : handleLogout}
          >
            {isGuest ? <LogIn size={15} /> : <LogOut size={15} />}
            {isGuest ? 'Войти' : 'Выйти'}
          </button>
        </div>

        {/* Строка статистики */}
        <div className={styles['stats-row']}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`${styles['stat']} ${statusFilter === tab.value ? styles['stat--active'] : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              <span className={styles['stat__value']}>0</span>
              <span className={styles['stat__label']}>{tab.label}</span>
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
            <BookOpen size={48} />
          </div>
          <p className={styles['empty-state__text']}>Список книг пуст</p>
          <p className={styles['empty-state__sub']}>Добавь первую книгу в свою библиотеку</p>
        </div>
      </div>
    </div>
  )
}
