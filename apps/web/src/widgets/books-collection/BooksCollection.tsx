import { useState } from 'react'
import {
  ArrowDownUp,
  BookOpen,
  Check,
  Filter,
  Image,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Box, Menu, MenuItem, Skeleton, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import { BookCoverCard, BookCoverCardSkeleton, BookTableRow } from '@/entities/book'
import type { BookEntry, BookStatus } from '@/entities/book'
import { SegmentedToggle } from '@/shared/ui'
import styles from './BooksCollection.module.scss'

/** Стиль отображения карточек книги. */
type CardStyle = 'cover' | 'table'

/** Ключ для сохранения выбранного стиля карточек между визитами. */
const CARD_STYLE_STORAGE_KEY = 'treqio_library_card_style'

/** Размер карточек книги в виде «Обложка». */
type CardSize = 'compact' | 'medium' | 'large'

/** Ключ для сохранения выбранного размера карточек между визитами. */
const CARD_SIZE_STORAGE_KEY = 'treqio_library_card_size'

/** Максимальная длина поискового запроса — названия и авторы книг короче. */
const SEARCH_QUERY_MAX = 60

/** Количество карточек-скелетов на время загрузки. */
const SKELETON_COUNT = 24

/** Фильтр по статусу записи — добавляет вариант «Все» к статусам книги. */
type StatusFilter = BookStatus | 'ALL'

/** Вариант сортировки списка книг. */
type SortOption = 'recent' | 'title' | 'author' | 'rating'

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
 * Свойства BooksCollection.
 */
interface BooksCollectionProps {
  /** Записи для отображения. */
  entries: BookEntry[]
  /** Флаг загрузки — вместо коллекции отрисовываются скелеты. */
  loading?: boolean | undefined
  /** Функция открытия карточки записи — без неё карточка не кликабельна. */
  onExpand?: ((entryId: string) => void) | undefined
  /** Функция изменения статуса записи — без неё статус только отображается. */
  onStatusChange?: ((entryId: string, status: BookStatus) => void) | undefined
  /** Функция изменения оценки записи — без неё оценка только отображается. */
  onRatingChange?: ((entryId: string, rating: number) => void) | undefined
}

/**
 * Коллекция книг с фильтрами, поиском и переключением вида.
 */
export const BooksCollection = ({
  entries,
  loading,
  onExpand,
  onStatusChange,
  onRatingChange,
}: BooksCollectionProps) => {
  const { t } = useTranslation()

  const CARD_SIZE_OPTIONS: { value: CardSize; label: string }[] = [
    { value: 'compact', label: t('library.size.compact') },
    { value: 'medium', label: t('library.size.medium') },
    { value: 'large', label: t('library.size.large') },
  ]

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recent', label: t('library.sort.recent') },
    { value: 'title', label: t('library.sort.title') },
    { value: 'author', label: t('library.sort.author') },
    { value: 'rating', label: t('library.sort.rating') },
  ]

  const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: t('library.statusAll') },
    { value: 'WANT', label: t('book.status.WANT') },
    { value: 'READING', label: t('book.status.READING') },
    { value: 'DONE', label: t('book.status.DONE') },
    { value: 'DROPPED', label: t('book.status.DROPPED') },
  ]

  // Читаем сохранённый стиль синхронно при инициализации — иначе при перезагрузке
  // страница на миг отрисуется с дефолтным стилем и тут же переключится на сохранённый.
  const [cardStyle, setCardStyleState] = useState<CardStyle>(
    () => (localStorage.getItem(CARD_STYLE_STORAGE_KEY) as CardStyle | null) ?? 'cover',
  )
  const [cardSize, setCardSizeState] = useState<CardSize>(
    () => (localStorage.getItem(CARD_SIZE_STORAGE_KEY) as CardSize | null) ?? 'medium',
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null)
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null)
  const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  // На мобильных выбор размера скрыт — всегда крупный (большие шрифты и
  // бейдж оценки), ровно 2 колонки карточек.
  const effectiveCardSize: CardSize = isMobile ? 'large' : cardSize
  // На мобильных табличный вид недоступен — переключатель скрыт, всегда обложки.
  const effectiveCardStyle: CardStyle = isMobile ? 'cover' : cardStyle

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

  /** Количество записей в указанном статусе — для счётчика на табе. */
  const countByStatus = (value: StatusFilter) =>
    value === 'ALL' ? entries.length : entries.filter((e) => e.status === value).length

  if (loading) {
    return (
      <>
        {!isMobile && (
          <div className={styles['collection__tabs']}>
            {[56, 110, 80, 95, 75].map((w, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={w}
                height={34}
                sx={{ borderRadius: '999px' }}
              />
            ))}
          </div>
        )}

        <div className={styles['collection__label-row']}>
          <Skeleton
            variant="rounded"
            sx={{ flex: 1, maxWidth: 480, height: 36, borderRadius: '10px' }}
          />
          <div className={styles['collection__label-row-actions']}>
            <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: '10px' }} />
            {!isMobile && (
              <>
                <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: '10px' }} />
                <Skeleton variant="rounded" width={72} height={40} sx={{ borderRadius: '11px' }} />
              </>
            )}
          </div>
        </div>

        <div
          className={`${styles['collection__grid']} ${styles[`collection__grid--${effectiveCardSize}`] ?? ''} ${styles['collection__grid--skeleton']}`}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <BookCoverCardSkeleton key={i} size={effectiveCardSize} />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {!isMobile && (
        <div className={styles['collection__tabs']}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`${styles['collection__tab']} ${statusFilter === tab.value ? styles['collection__tab--active'] : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
              <span className={styles['collection__tab-count']}>{countByStatus(tab.value)}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles['collection__label-row']}>
        <div className={styles['collection__search']}>
          <Search
            size={16}
            className={normalizedQuery ? styles['collection__search-icon--active'] : undefined}
          />
          <input
            className={styles['collection__search-input']}
            type="text"
            placeholder={t('library.searchPlaceholder')}
            value={searchQuery}
            maxLength={SEARCH_QUERY_MAX}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Tooltip title={t('library.clearSearch')}>
              <button
                className={styles['collection__search-clear']}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            </Tooltip>
          )}
        </div>
        <div className={styles['collection__label-row-actions']}>
          {isMobile && (
            <>
              <Tooltip title={t('library.filterByStatus')}>
                <button
                  className={`${styles['collection__filter-btn']} ${statusFilter !== 'ALL' ? styles['collection__filter-btn--active'] : ''}`}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  <Filter size={15} />
                </button>
              </Tooltip>
              <Menu
                anchorEl={filterAnchor}
                open={!!filterAnchor}
                onClose={() => setFilterAnchor(null)}
                slotProps={{ list: { dense: true } }}
              >
                {STATUS_TABS.map((tab) => (
                  <MenuItem
                    key={tab.value}
                    className={styles['collection__menu-item']}
                    selected={tab.value === statusFilter}
                    onClick={() => {
                      setStatusFilter(tab.value)
                      setFilterAnchor(null)
                    }}
                  >
                    <Box className={styles['collection__menu-item-label']}>{tab.label}</Box>
                    <Box className={styles['collection__menu-item-count']}>
                      {countByStatus(tab.value)}
                    </Box>
                    {tab.value === statusFilter && <Check size={14} />}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <button
            className={styles['collection__sort-btn']}
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
                className={styles['collection__menu-item']}
                selected={option.value === sortBy}
                onClick={() => {
                  setSortBy(option.value)
                  setSortAnchor(null)
                }}
              >
                <Box className={styles['collection__menu-item-label']}>{option.label}</Box>
                {option.value === sortBy && <Check size={14} />}
              </MenuItem>
            ))}
          </Menu>
          {!isMobile && effectiveCardStyle === 'cover' && (
            <>
              <Tooltip title={t('library.cardSizeLabel')}>
                <button
                  className={styles['collection__sort-btn']}
                  onClick={(e) => setSizeAnchor(e.currentTarget)}
                >
                  <SlidersHorizontal size={15} />
                  {CARD_SIZE_OPTIONS.find((o) => o.value === cardSize)?.label}
                </button>
              </Tooltip>
              <Menu
                anchorEl={sizeAnchor}
                open={!!sizeAnchor}
                onClose={() => setSizeAnchor(null)}
                slotProps={{ list: { dense: true } }}
              >
                {CARD_SIZE_OPTIONS.map((option) => (
                  <MenuItem
                    key={option.value}
                    className={styles['collection__menu-item']}
                    selected={option.value === cardSize}
                    onClick={() => {
                      setCardSize(option.value)
                      setSizeAnchor(null)
                    }}
                  >
                    <Box className={styles['collection__menu-item-label']}>{option.label}</Box>
                    {option.value === cardSize && <Check size={14} />}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {/* Переключатель представления (карточка/таблица) для больших экранов */}
          {!isMobile && (
            <SegmentedToggle
              value={cardStyle}
              onChange={setCardStyle}
              options={[
                { value: 'cover', icon: <Image size={22} />, tooltip: t('library.viewCovers') },
                { value: 'table', icon: <List size={22} />, tooltip: t('library.viewTable') },
              ]}
            />
          )}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className={styles['collection__empty']}>
          <div className={styles['collection__empty-icon']}>
            <BookOpen size={48} />
          </div>
          <p className={styles['collection__empty-text']}>
            {normalizedQuery
              ? t('library.filteredEmpty.noResults', { query: searchQuery.trim() })
              : t('library.filteredEmpty.noStatus')}
          </p>
        </div>
      ) : effectiveCardStyle === 'table' ? (
        <div className={styles['collection__table']}>
          <div className={styles['collection__table-head']}>
            <span />
            <span>{t('library.table.title')}</span>
            <span>{t('library.table.status')}</span>
            <span>{t('library.table.rating')}</span>
          </div>
          {filteredEntries.map((entry) => (
            <BookTableRow
              key={entry.id}
              entry={entry}
              {...(onExpand && { onEdit: () => onExpand(entry.id) })}
              {...(onStatusChange && {
                onStatusChange: (status: BookStatus) => onStatusChange(entry.id, status),
              })}
              {...(onRatingChange && {
                onRatingChange: (rating: number) => onRatingChange(entry.id, rating),
              })}
            />
          ))}
        </div>
      ) : (
        <div
          className={`${styles['collection__grid']} ${styles[`collection__grid--${effectiveCardSize}`] ?? ''}`}
        >
          {filteredEntries.map((entry) => (
            <BookCoverCard
              key={entry.id}
              entry={entry}
              size={effectiveCardSize}
              showStatus={statusFilter === 'ALL'}
              {...(onExpand && { onExpand: () => onExpand(entry.id) })}
              {...(onStatusChange && {
                onStatusChange: (status: BookStatus) => onStatusChange(entry.id, status),
              })}
              {...(onRatingChange && {
                onRatingChange: (rating: number) => onRatingChange(entry.id, rating),
              })}
            />
          ))}
        </div>
      )}
    </>
  )
}
