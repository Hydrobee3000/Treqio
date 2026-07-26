import { useState } from 'react'
import { LayoutGroup } from 'framer-motion'
import { BookOpen, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { BookExpandModal } from '@/entities/book'
import type { BookFieldUpdate, EntryFieldUpdate, CreateBookPayload } from '@/entities/book'
import {
  useCreateBookMutation,
  useCreateEntryMutation,
  useDeleteEntryMutation,
  useGetMyEntriesQuery,
  useUpdateBookMutation,
  useUpdateEntryMutation,
} from '@/features/book'
import { saveRedirectPath } from '@/shared/lib/redirectPath'
import { useAppSelector } from '@/shared/lib/store'
import { BooksCollection } from '@/widgets/books-collection'
import { GuestLoginCard } from './ui/GuestLoginCard/GuestLoginCard'
import styles from './LibraryPage.module.scss'

/**
 * Страница библиотеки пользователя.
 */
export const LibraryPage = () => {
  const { t } = useTranslation()

  const [addOpen, setAddOpen] = useState(false)
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [guestPromptOpen, setGuestPromptOpen] = useState(false)

  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMyEntriesQuery()
  const [createBook] = useCreateBookMutation()
  const [createEntry] = useCreateEntryMutation()
  const [updateEntry] = useUpdateEntryMutation()
  const [updateBook] = useUpdateBookMutation()
  const [deleteEntry] = useDeleteEntryMutation()
  const entries = data ?? []
  const expandedEntry = entries.find((e) => e.id === expandedEntryId) ?? null
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

  const handleSaveBook = async (dto: BookFieldUpdate) => {
    if (!expandedEntry) return
    await updateBook({ id: expandedEntry.book.id, dto }).unwrap()
  }

  const handleSaveEntry = async (dto: EntryFieldUpdate) => {
    if (!expandedEntry) return
    await updateEntry({ id: expandedEntry.id, dto }).unwrap()
  }

  const handleCreate = async (payload: CreateBookPayload) => {
    const book = await createBook({
      title: payload.title,
      author: payload.author,
      ...(payload.pageCount && { pageCount: payload.pageCount }),
      ...(payload.description && { description: payload.description }),
    }).unwrap()
    const newEntry = await createEntry({ bookId: book.id, status: payload.status }).unwrap()
    const extraDto = {
      ...(payload.rating && { rating: payload.rating }),
      ...(payload.progress && { progress: payload.progress }),
      ...(payload.notes && { notes: payload.notes }),
    }
    if (Object.keys(extraDto).length > 0) {
      await updateEntry({ id: newEntry.id, dto: extraDto }).unwrap()
    }
  }

  const handleExpandDelete = async () => {
    if (!expandedEntry) return
    await deleteEntry(expandedEntry.id).unwrap()
  }

  const header = (
    <div className={styles['library__header']}>
      <h1 className={styles['library__title']}>{t('library.title')}</h1>
      <button className={styles['library__add-btn']} onClick={handleAddClick}>
        <Plus size={16} />
        <span className={styles['library__add-btn-label']}>{t('library.addBook')}</span>
      </button>
    </div>
  )

  if (isLoading) {
    return (
      <div className={styles.library} style={{ height: '100%' }}>
        {header}
        <BooksCollection entries={[]} loading />
      </div>
    )
  }

  return (
    <LayoutGroup id="library">
      <div className={styles.library}>
        {header}

        {isError ? (
          <div className={styles['library__empty']}>
            <div className={styles['library__empty-icon']}>
              <BookOpen size={48} />
            </div>
            <p className={styles['library__empty-text']}>{t('library.error.loadTitle')}</p>
            <p className={styles['library__empty-sub']}>{t('library.error.loadSub')}</p>
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
            <h2 className={styles['library__empty-title']}>{t('library.empty.title')}</h2>
            <p className={styles['library__empty-desc']}>{t('library.empty.desc')}</p>
            <div className={styles['library__empty-actions']}>
              <button className={styles['library__cta-primary']} onClick={handleAddClick}>
                <Plus size={17} />
                {t('library.empty.addBook')}
              </button>
            </div>
          </div>
        ) : (
          <BooksCollection
            entries={entries}
            onExpand={setExpandedEntryId}
            onStatusChange={(id, status) => updateEntry({ id, dto: { status } })}
            onRatingChange={(id, rating) => updateEntry({ id, dto: { rating } })}
          />
        )}

        <BookExpandModal
          entry={expandedEntry}
          creating={addOpen}
          onClose={() => {
            setExpandedEntryId(null)
            setAddOpen(false)
          }}
          onSaveBook={handleSaveBook}
          onSaveEntry={handleSaveEntry}
          onCreate={handleCreate}
          onDelete={handleExpandDelete}
          onStatusChange={(status) => {
            if (expandedEntry) void updateEntry({ id: expandedEntry.id, dto: { status } })
          }}
        />

        <GuestLoginCard
          open={guestPromptOpen}
          onClose={() => setGuestPromptOpen(false)}
          onLogin={handleGoToLogin}
        />
      </div>
    </LayoutGroup>
  )
}
