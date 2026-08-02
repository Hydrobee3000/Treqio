import { useState } from 'react'
import { LayoutGroup } from 'framer-motion'
import { BookOpen, LogIn } from 'lucide-react'
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
import { ConfirmCard } from '@/shared/ui'
import { BooksCollection } from '@/widgets/books-collection'
import { LibraryEmptyState } from './LibraryEmptyState/LibraryEmptyState'
import { LibraryHeader } from './LibraryHeader/LibraryHeader'
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

  /**
   * Открывает форму добавления книги; если гость - предложение залогиниться.
   */
  const handleAddClick = () => {
    if (isGuest) {
      setGuestPromptOpen(true)
      return
    }
    setAddOpen(true)
  }

  /**
   * Сохраняет текущий путь и ведёт на страницу входа.
   */
  const handleGoToLogin = () => {
    saveRedirectPath('/library')
    void navigate('/login')
  }

  /**
   * Сохраняет изменения полей книги.
   */
  const handleSaveBook = async (dto: BookFieldUpdate) => {
    if (!expandedEntry) return
    await updateBook({ id: expandedEntry.book.id, dto }).unwrap()
  }

  /**
   * Сохраняет изменения полей записи.
   */
  const handleSaveEntry = async (dto: EntryFieldUpdate) => {
    if (!expandedEntry) return
    await updateEntry({ id: expandedEntry.id, dto }).unwrap()
  }

  /**
   * Создаёт новую книгу и запись по ней, затем сохраняет необязательные поля
   * записи отдельным запросом, если они были заданы.
   */
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

  /**
   * Удаляет запись.
   */
  const handleExpandDelete = async () => {
    if (!expandedEntry) return
    await deleteEntry(expandedEntry.id).unwrap()
  }

  if (isLoading) {
    return (
      <div className={styles.library} style={{ height: '100%' }}>
        <LibraryHeader onAddClick={handleAddClick} />
        <BooksCollection entries={[]} loading />
      </div>
    )
  }

  return (
    <LayoutGroup id="library">
      <div className={styles.library}>
        <LibraryHeader onAddClick={handleAddClick} />

        {isError ? (
          <div className={styles['library__empty']}>
            <div className={styles['library__empty-icon']}>
              <BookOpen size={48} />
            </div>
            <p className={styles['library__empty-text']}>{t('library.error.loadTitle')}</p>
            <p className={styles['library__empty-sub']}>{t('library.error.loadSub')}</p>
          </div>
        ) : isEmpty ? (
          <LibraryEmptyState onAddClick={handleAddClick} />
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

        <ConfirmCard
          open={guestPromptOpen}
          title={t('library.loginRequired.title')}
          description={t('library.loginRequired.desc')}
          cancelLabel={t('library.loginRequired.cancel')}
          confirmLabel={t('library.loginRequired.login')}
          confirmIcon={<LogIn size={15} />}
          onCancel={() => setGuestPromptOpen(false)}
          onConfirm={handleGoToLogin}
        />
      </div>
    </LayoutGroup>
  )
}
