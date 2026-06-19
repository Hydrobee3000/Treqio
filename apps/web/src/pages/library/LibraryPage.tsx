import { useState } from 'react'
import { BookOpen, Image, LayoutGrid, Plus, Upload } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import { BookCard, BookCoverCard } from '@/entities/book'
import { AddBookDialog, useGetMyEntriesQuery } from '@/features/book'
import { saveRedirectPath } from '@/shared/lib/redirectPath'
import { useAppSelector } from '@/shared/lib/store'
import styles from './LibraryPage.module.scss'

/** Стиль отображения карточек книги. */
type CardStyle = 'compact' | 'cover'

/**
 * Страница библиотеки пользователя.
 */
export const LibraryPage = () => {
  const [cardStyle, setCardStyle] = useState<CardStyle>('compact')
  const [addOpen, setAddOpen] = useState(false)
  const [guestPromptOpen, setGuestPromptOpen] = useState(false)
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMyEntriesQuery()
  const entries = data ?? []
  const isEmpty = !isError && entries.length === 0

  /** Открывает форму добавления книги, либо для гостя — предлагает войти. */
  const handleAddClick = () => {
    if (isGuest) {
      setGuestPromptOpen(true)
      return
    }
    setAddOpen(true)
  }

  /** Сохраняет текущий путь и ведёт на страницу входа. */
  const handleGoToLogin = () => {
    saveRedirectPath('/library')
    void navigate('/login')
  }

  if (isLoading) return null

  return (
    <div className={styles.library}>
      <div className={styles['library__header']}>
        <h1 className={styles['library__title']}>Моя библиотека</h1>
        <button className={styles['library__add-btn']} onClick={handleAddClick}>
          <Plus size={16} />
          Добавить книгу
        </button>
      </div>

      {!isError && (
        <div className={styles['library__label-row']}>
          <span className={styles['library__label']}>{entries.length} книг</span>

          <div className={styles['library__style-toggle']}>
            <button
              className={`${styles['library__style-btn']} ${cardStyle === 'compact' ? styles['library__style-btn--active'] : ''}`}
              onClick={() => setCardStyle('compact')}
              title="Компактный вид"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`${styles['library__style-btn']} ${cardStyle === 'cover' ? styles['library__style-btn--active'] : ''}`}
              onClick={() => setCardStyle('cover')}
              title="Вид обложками"
            >
              <Image size={16} />
            </button>
          </div>
        </div>
      )}

      {isError ? (
        <div className={styles['library__empty']}>
          <div className={styles['library__empty-icon']}>
            <BookOpen size={48} />
          </div>
          <p className={styles['library__empty-text']}>Не удалось загрузить библиотеку</p>
          <p className={styles['library__empty-sub']}>Попробуй обновить страницу</p>
        </div>
      ) : isEmpty ? (
        <div className={styles['library__empty-lib']}>
          <div className={styles['library__empty-shelf']}>
            <div className={styles['library__ghost']} />
            <div className={`${styles['library__ghost']} ${styles['library__ghost--tall']}`} />
            <div className={`${styles['library__ghost']} ${styles['library__ghost--accent']}`} />
            <div className={`${styles['library__ghost']} ${styles['library__ghost--tall']}`} />
            <div className={styles['library__ghost']} />
          </div>
          <h2 className={styles['library__empty-title']}>Здесь пока пусто</h2>
          <p className={styles['library__empty-desc']}>
            Добавь первую книгу — и она появится на твоей полке.
          </p>
          <div className={styles['library__empty-actions']}>
            <button className={styles['library__cta-primary']} onClick={handleAddClick}>
              <Plus size={17} />
              Добавить книгу
            </button>
            <button className={styles['library__cta-ghost']} disabled title="Скоро">
              <Upload size={16} />
              Импортировать список
            </button>
          </div>
        </div>
      ) : (
        <div className={styles['library__grid']}>
          {entries.map((entry) =>
            cardStyle === 'compact' ? (
              <BookCard key={entry.id} entry={entry} />
            ) : (
              <BookCoverCard key={entry.id} entry={entry} />
            ),
          )}
        </div>
      )}

      <AddBookDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog open={guestPromptOpen} onClose={() => setGuestPromptOpen(false)}>
        <DialogTitle sx={{ pt: 3, px: 3 }}>Необходимо войти</DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <DialogContentText>
            Добавлять книги может только зарегистрированный пользователь.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ minWidth: 100 }}
            onClick={() => setGuestPromptOpen(false)}
          >
            Отмена
          </Button>
          <Button variant="contained" sx={{ minWidth: 100 }} onClick={handleGoToLogin}>
            Войти
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
