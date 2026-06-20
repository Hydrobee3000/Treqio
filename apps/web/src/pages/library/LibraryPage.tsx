import { useState } from 'react'
import { BookOpen, Image, List, Plus, Upload } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import { BookCoverCard, BookTableRow, STATUS_LABEL } from '@/entities/book'
import type { BookEntry, BookStatus } from '@/entities/book'
import { BookFormDialog, useGetMyEntriesQuery, useUpdateEntryMutation } from '@/features/book'
import { saveRedirectPath } from '@/shared/lib/redirectPath'
import { useAppSelector } from '@/shared/lib/store'
import styles from './LibraryPage.module.scss'

/** Стиль отображения карточек книги. */
type CardStyle = 'cover' | 'table'

/** Ключ для сохранения выбранного стиля карточек между визитами. */
const CARD_STYLE_STORAGE_KEY = 'treqio_library_card_style'

/** Фильтр по статусу записи — добавляет вариант «Все» к статусам книги. */
type StatusFilter = BookStatus | 'ALL'

/** Табы фильтра по статусу над сеткой карточек. */
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value: value as BookStatus, label })),
]

/**
 * Страница библиотеки пользователя.
 */
export const LibraryPage = () => {
  // Читаем сохранённый стиль синхронно при инициализации — иначе при перезагрузке
  // страница на миг отрисуется с дефолтным стилем и тут же переключится на сохранённый.
  const [cardStyle, setCardStyleState] = useState<CardStyle>(
    () => (localStorage.getItem(CARD_STYLE_STORAGE_KEY) as CardStyle | null) ?? 'cover',
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<BookEntry | null>(null)
  const [guestPromptOpen, setGuestPromptOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMyEntriesQuery()
  const [updateEntry] = useUpdateEntryMutation()
  const entries = data ?? []
  const isEmpty = !isError && entries.length === 0
  const filteredEntries =
    statusFilter === 'ALL' ? entries : entries.filter((entry) => entry.status === statusFilter)
  const isFilteredEmpty = !isEmpty && filteredEntries.length === 0

  /** Меняет стиль карточек и сохраняет выбор в localStorage. */
  const setCardStyle = (style: CardStyle) => {
    setCardStyleState(style)
    localStorage.setItem(CARD_STYLE_STORAGE_KEY, style)
  }

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

      {!isError && !isEmpty && (
        <div className={styles['library__tabs']}>
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === 'ALL'
                ? entries.length
                : entries.filter((e) => e.status === tab.value).length
            return (
              <button
                key={tab.value}
                className={`${styles['library__tab']} ${statusFilter === tab.value ? styles['library__tab--active'] : ''}`}
                onClick={() => setStatusFilter(tab.value)}
              >
                {tab.label}
                <span className={styles['library__tab-count']}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {!isError && (
        <div className={styles['library__label-row']}>
          <span className={styles['library__label']}>{filteredEntries.length} книг</span>

          <div className={styles['library__style-toggle']}>
            <button
              className={`${styles['library__style-btn']} ${cardStyle === 'cover' ? styles['library__style-btn--active'] : ''}`}
              onClick={() => setCardStyle('cover')}
              title="Вид обложками"
            >
              <Image size={22} />
            </button>
            <button
              className={`${styles['library__style-btn']} ${cardStyle === 'table' ? styles['library__style-btn--active'] : ''}`}
              onClick={() => setCardStyle('table')}
              title="Табличный вид"
            >
              <List size={22} />
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
      ) : isFilteredEmpty ? (
        <div className={styles['library__empty']}>
          <div className={styles['library__empty-icon']}>
            <BookOpen size={48} />
          </div>
          <p className={styles['library__empty-text']}>Нет книг с этим статусом</p>
        </div>
      ) : cardStyle === 'table' ? (
        <div className={styles['library__table']}>
          <div className={styles['library__table-head']}>
            <span />
            <span>Название</span>
            <span>Статус</span>
            <span>Оценка</span>
          </div>
          {filteredEntries.map((entry) => (
            <BookTableRow
              key={entry.id}
              entry={entry}
              onEdit={() => setEditEntry(entry)}
              onStatusChange={(status) => updateEntry({ id: entry.id, dto: { status } })}
              onRatingChange={(rating) => updateEntry({ id: entry.id, dto: { rating } })}
            />
          ))}
        </div>
      ) : (
        <div className={styles['library__grid']}>
          {filteredEntries.map((entry) => (
            <BookCoverCard
              key={entry.id}
              entry={entry}
              onEdit={() => setEditEntry(entry)}
              onStatusChange={(status) => updateEntry({ id: entry.id, dto: { status } })}
              onRatingChange={(rating) => updateEntry({ id: entry.id, dto: { rating } })}
            />
          ))}
        </div>
      )}

      <BookFormDialog
        key={editEntry?.id ?? (addOpen ? 'add' : 'closed')}
        open={addOpen || !!editEntry}
        entry={editEntry ?? undefined}
        onClose={() => {
          setAddOpen(false)
          setEditEntry(null)
        }}
      />

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
