import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
} from '@mui/material'
import type { BookEntry, BookStatus } from '@/entities/book'
import {
  useCreateBookMutation,
  useCreateEntryMutation,
  useUpdateBookMutation,
  useUpdateEntryMutation,
} from '../../api/booksApi'

/** Варианты статуса книги для выбора в форме. */
const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'WANT', label: 'Хочу прочитать' },
  { value: 'READING', label: 'Читаю' },
  { value: 'DONE', label: 'Прочитал' },
  { value: 'DROPPED', label: 'Брошено' },
]

/**
 * Значения полей формы добавления/редактирования книги.
 */
interface BookFormValues {
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** URL обложки. */
  coverUrl: string
  /** Количество страниц (строка из инпута, переводится в число при отправке). */
  pageCount: string
  /** Статус книги в списке пользователя. */
  status: BookStatus
  /** Оценка от 1 до 10 (строка из инпута, только при редактировании). */
  rating: string
}

/** Начальные значения формы добавления книги. */
const DEFAULT_VALUES: BookFormValues = {
  title: '',
  author: '',
  coverUrl: '',
  pageCount: '',
  status: 'WANT',
  rating: '',
}

/** Значение автора, если поле оставлено пустым. */
const UNKNOWN_AUTHOR = 'Автор неизвестен'

/** Преобразует существующую запись в значения формы редактирования. */
function entryToFormValues(entry: BookEntry): BookFormValues {
  return {
    title: entry.book.title,
    author: entry.book.author,
    coverUrl: entry.book.coverUrl ?? '',
    pageCount: entry.book.pageCount ? String(entry.book.pageCount) : '',
    status: entry.status,
    rating: entry.rating ? String(entry.rating) : '',
  }
}

/**
 * Пропсы BookFormDialog.
 */
interface BookFormDialogProps {
  /** Открыта ли модалка. */
  open: boolean
  /** Закрытие модалки. */
  onClose: () => void
  /** Редактируемая запись. Если не передана — модалка работает в режиме добавления. */
  entry?: BookEntry
}

/**
 * Модалка добавления новой книги или редактирования существующей записи пользователя.
 */
export const BookFormDialog = ({ open, onClose, entry }: BookFormDialogProps) => {
  const isEdit = !!entry
  const [error, setError] = useState<string | null>(null)
  const [createBook] = useCreateBookMutation()
  const [createEntry] = useCreateEntryMutation()
  const [updateBook] = useUpdateBookMutation()
  const [updateEntry] = useUpdateEntryMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<BookFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  // При каждом открытии модалки заполняем форму данными редактируемой записи
  // (либо пустыми значениями для добавления) — компонент не размонтируется между открытиями.
  useEffect(() => {
    if (open) {
      reset(entry ? entryToFormValues(entry) : DEFAULT_VALUES)
    }
  }, [open, entry, reset])

  /**
   * Функция закрытия модалки.
   */
  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  /**
   * Функция отправки формы — создаёт книгу и запись, либо сохраняет изменения существующей.
   */
  const onSubmit = async (values: BookFormValues) => {
    setError(null)
    try {
      const bookDto = {
        title: values.title.trim(),
        author: values.author.trim() || UNKNOWN_AUTHOR,
        ...(values.coverUrl.trim() && { coverUrl: values.coverUrl.trim() }),
        ...(values.pageCount && { pageCount: Number(values.pageCount) }),
      }

      if (entry) {
        await updateBook({ id: entry.book.id, dto: bookDto }).unwrap()
        await updateEntry({
          id: entry.id,
          dto: {
            status: values.status,
            ...(values.rating && { rating: Number(values.rating) }),
          },
        }).unwrap()
      } else {
        const book = await createBook(bookDto).unwrap()
        await createEntry({ bookId: book.id, status: values.status }).unwrap()
      }

      onClose()
    } catch {
      setError(
        isEdit
          ? 'Не удалось сохранить изменения. Попробуй ещё раз.'
          : 'Не удалось добавить книгу. Попробуй ещё раз.',
      )
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Редактировать книгу' : 'Добавить книгу'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Название"
              required
              fullWidth
              autoFocus
              error={!!errors.title}
              helperText={errors.title ? 'Обязательное поле' : ''}
              {...register('title', { required: true })}
            />
            <TextField label="Автор" fullWidth {...register('author')} />
            <TextField label="Обложка (URL)" fullWidth {...register('coverUrl')} />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Количество страниц"
                type="number"
                sx={{ flex: 1 }}
                {...register('pageCount')}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField select label="Статус" sx={{ flex: 1 }} {...field}>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>

            {isEdit && (
              <TextField
                label="Оценка (1–10)"
                type="number"
                fullWidth
                inputProps={{ min: 1, max: 10 }}
                {...register('rating')}
              />
            )}

            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
