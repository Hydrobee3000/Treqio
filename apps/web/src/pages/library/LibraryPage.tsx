import { useState } from 'react'
import {
  ArrowDownUp,
  BookOpen,
  Check,
  Filter,
  Image,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
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

/** Размер карточек книги в виде «Обложка». */
type CardSize = 'compact' | 'medium' | 'large'

/** Ключ для сохранения выбранного размера карточек между визитами. */
const CARD_SIZE_STORAGE_KEY = 'treqio_library_card_size'

/** Варианты размера карточек для выпадающего списка. */
const CARD_SIZE_OPTIONS: { value: CardSize; label: string }[] = [
  { value: 'compact', label: 'Компактный' },
  { value: 'medium', label: 'Средний' },
  { value: 'large', label: 'Крупный' },
]

/** Максимальная длина поискового запроса — названия и авторы книг короче. */
const SEARCH_QUERY_MAX = 60

/** Фильтр по статусу записи — добавляет вариант «Все» к статусам книги. */
type StatusFilter = BookStatus | 'ALL'

/** Табы фильтра по статусу над сеткой карточек. */
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value: value as BookStatus, label })),
]

/** Вариант сортировки списка книг. */
type SortOption = 'recent' | 'title' | 'author' | 'rating'

/** Варианты сортировки для выпадающего списка. */
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Сначала новые' },
  { value: 'title', label: 'По названию' },
  { value: 'author', label: 'По автору' },
  { value: 'rating', label: 'По оценке' },
]

/** Сортирует записи по выбранному критерию — не мутирует исходный массив. */
function sortEntries(entries: BookEntry[], sortBy: SortOption): BookEntry[] {
  const sorted = [...entries]
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.book.title.localeCompare(b.book.title, 'ru'))
    case 'author':
      return sorted.sort((a, b) => a.book.author.localeCompare(b.book.author, 'ru'))
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    case 'recent':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }
}

/**
 * Страница библиотеки пользователя.
 */
export const LibraryPage = () => {
  // Читаем сохранённый стиль синхронно при инициализации — иначе при перезагрузке
  // страница на миг отрисуется с дефолтным стилем и тут же переключится на сохранённый.
  const [cardStyle, setCardStyleState] = useState<CardStyle>(
    () => (localStorage.getItem(CARD_STYLE_STORAGE_KEY) as CardStyle | null) ?? 'cover',
  )
  const [cardSize, setCardSizeState] = useState<CardSize>(
    () => (localStorage.getItem(CARD_SIZE_STORAGE_KEY) as CardSize | null) ?? 'medium',
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<BookEntry | null>(null)
  const [guestPromptOpen, setGuestPromptOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null)
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  // На мобильных выбор размера скрыт — всегда крупный (большие шрифты и
  // бейдж оценки), ровно 2 колонки обеспечивает мобильный minmax в SCSS.
  const effectiveCardSize: CardSize = isMobile ? 'large' : cardSize

  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMyEntriesQuery()
  const [updateEntry] = useUpdateEntryMutation()
  const entries = data ?? []
  const isEmpty = !isError && entries.length === 0
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredEntries = sortEntries(
    entries.filter((entry) => {
      const matchesStatus = statusFilter === 'ALL' || entry.status === statusFilter
      const matchesQuery =
        !normalizedQuery ||
        entry.book.title.toLowerCase().includes(normalizedQuery) ||
        entry.book.author.toLowerCase().includes(normalizedQuery)
      return matchesStatus && matchesQuery
    }),
    sortBy,
  )
  const isFilteredEmpty = !isEmpty && filteredEntries.length === 0

  /** Меняет стиль карточек и сохраняет выбор в localStorage. */
  const setCardStyle = (style: CardStyle) => {
    setCardStyleState(style)
    localStorage.setItem(CARD_STYLE_STORAGE_KEY, style)
  }

  /** Меняет размер карточек и сохраняет выбор в localStorage. */
  const setCardSize = (size: CardSize) => {
    setCardSizeState(size)
    localStorage.setItem(CARD_SIZE_STORAGE_KEY, size)
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
          <span className={styles['library__add-btn-label']}>Добавить книгу</span>
        </button>
      </div>

      {!isError && !isEmpty && !isMobile && (
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

      {!isError && !isEmpty && (
        <div className={styles['library__label-row']}>
          <div className={styles['library__search']}>
            <Search
              size={16}
              className={normalizedQuery ? styles['library__search-icon--active'] : undefined}
            />
            <input
              className={styles['library__search-input']}
              type="text"
              placeholder="Поиск по названию или автору"
              value={searchQuery}
              maxLength={SEARCH_QUERY_MAX}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles['library__search-clear']}
                onClick={() => setSearchQuery('')}
                title="Очистить"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className={styles['library__label-row-actions']}>
            {isMobile && (
              <>
                <button
                  className={`${styles['library__filter-btn']} ${statusFilter !== 'ALL' ? styles['library__filter-btn--active'] : ''}`}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                  title="Фильтр по статусу"
                >
                  <Filter size={15} />
                </button>
                <Menu
                  anchorEl={filterAnchor}
                  open={!!filterAnchor}
                  onClose={() => setFilterAnchor(null)}
                  slotProps={{ list: { dense: true } }}
                >
                  {STATUS_TABS.map((tab) => {
                    const count =
                      tab.value === 'ALL'
                        ? entries.length
                        : entries.filter((e) => e.status === tab.value).length
                    return (
                      <MenuItem
                        key={tab.value}
                        className={styles['library__menu-item']}
                        selected={tab.value === statusFilter}
                        onClick={() => {
                          setStatusFilter(tab.value)
                          setFilterAnchor(null)
                        }}
                      >
                        <Box className={styles['library__menu-item-label']}>{tab.label}</Box>
                        <Box className={styles['library__menu-item-count']}>{count}</Box>
                        {tab.value === statusFilter && <Check size={14} />}
                      </MenuItem>
                    )
                  })}
                </Menu>
              </>
            )}
            <button
              className={styles['library__sort-btn']}
              onClick={(e) => setSortAnchor(e.currentTarget)}
            >
              <ArrowDownUp size={15} />
              {!isMobile && SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            </button>
            <Menu
              anchorEl={sortAnchor}
              open={!!sortAnchor}
              onClose={() => setSortAnchor(null)}
              slotProps={{ list: { dense: true } }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  className={styles['library__menu-item']}
                  selected={option.value === sortBy}
                  onClick={() => {
                    setSortBy(option.value)
                    setSortAnchor(null)
                  }}
                >
                  <Box className={styles['library__menu-item-label']}>{option.label}</Box>
                  {option.value === sortBy && <Check size={14} />}
                </MenuItem>
              ))}
            </Menu>
            {!isMobile && cardStyle === 'cover' && (
              <>
                <button
                  className={styles['library__sort-btn']}
                  onClick={(e) => setSizeAnchor(e.currentTarget)}
                  title="Размер карточек"
                >
                  <SlidersHorizontal size={15} />
                  {CARD_SIZE_OPTIONS.find((o) => o.value === cardSize)?.label}
                </button>
                <Menu
                  anchorEl={sizeAnchor}
                  open={!!sizeAnchor}
                  onClose={() => setSizeAnchor(null)}
                  slotProps={{ list: { dense: true } }}
                >
                  {CARD_SIZE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      className={styles['library__menu-item']}
                      selected={option.value === cardSize}
                      onClick={() => {
                        setCardSize(option.value)
                        setSizeAnchor(null)
                      }}
                    >
                      <Box className={styles['library__menu-item-label']}>{option.label}</Box>
                      {option.value === cardSize && <Check size={14} />}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
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
          <p className={styles['library__empty-text']}>
            {normalizedQuery
              ? `Ничего не найдено по запросу «${searchQuery.trim()}»`
              : 'Нет книг с этим статусом'}
          </p>
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
        <div
          className={`${styles['library__grid']} ${styles[`library__grid--${effectiveCardSize}`] ?? ''}`}
        >
          {filteredEntries.map((entry) => (
            <BookCoverCard
              key={entry.id}
              entry={entry}
              size={effectiveCardSize}
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
