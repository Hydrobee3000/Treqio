import { useState } from 'react'
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
import type { BookStatus } from '@/entities/book'
import { useCreateBookMutation, useCreateEntryMutation } from '../../api/booksApi'

/** Варианты статуса книги для выбора в форме. */
const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'WANT', label: 'Хочу прочитать' },
  { value: 'READING', label: 'Читаю' },
  { value: 'DONE', label: 'Прочитал' },
  { value: 'DROPPED', label: 'Брошено' },
]

/**
 * Значения полей формы добавления книги.
 */
interface AddBookFormValues {
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** URL обложки. */
  coverUrl: string
  /** Количество страниц (строка из инпута, переводится в число при отправке). */
  pageCount: string
  /** Статус, с которым книга добавляется в список. */
  status: BookStatus
}

/** Начальные значения формы добавления книги. */
const DEFAULT_VALUES: AddBookFormValues = {
  title: '',
  author: '',
  coverUrl: '',
  pageCount: '',
  status: 'WANT',
}

/** Значение автора, если поле оставлено пустым. */
const UNKNOWN_AUTHOR = 'Автор неизвестен'

/**
 * Пропсы AddBookDialog.
 */
interface AddBookDialogProps {
  /** Открыта ли модалка. */
  open: boolean
  /** Закрытие модалки. */
  onClose: () => void
}

/**
 * Модалка добавления книги — создаёт книгу в каталоге и сразу запись пользователя.
 */
export const AddBookDialog = ({ open, onClose }: AddBookDialogProps) => {
  const [error, setError] = useState<string | null>(null)
  const [createBook] = useCreateBookMutation()
  const [createEntry] = useCreateEntryMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<AddBookFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  /**
   * Функция закрытия модалки с очисткой формы.
   */
  const handleClose = () => {
    if (isSubmitting) return
    reset(DEFAULT_VALUES)
    setError(null)
    onClose()
  }

  /**
   * Функция отправки формы — создаёт книгу и сразу запись пользователя.
   */
  const onSubmit = async (values: AddBookFormValues) => {
    setError(null)
    try {
      const book = await createBook({
        title: values.title.trim(),
        author: values.author.trim() || UNKNOWN_AUTHOR,
        ...(values.coverUrl.trim() && { coverUrl: values.coverUrl.trim() }),
        ...(values.pageCount && { pageCount: Number(values.pageCount) }),
      }).unwrap()

      await createEntry({ bookId: book.id, status: values.status }).unwrap()

      reset(DEFAULT_VALUES)
      onClose()
    } catch {
      setError('Не удалось добавить книгу. Попробуй ещё раз.')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Добавить книгу</DialogTitle>
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

            {error && <Typography color="error">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
            Добавить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
