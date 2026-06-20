import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
  Rating,
  Slider,
  Typography,
  IconButton,
} from '@mui/material'
import { X } from 'lucide-react'
import { STATUS_LABEL } from '@/entities/book'
import type { BookEntry, BookStatus } from '@/entities/book'
import {
  useCreateBookMutation,
  useCreateEntryMutation,
  useUpdateBookMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
} from '../../api/booksApi'
import type { UpdateBookEntryDto } from '../../api/booksApi'

/** Варианты статуса книги для выбора в форме. */
const STATUS_OPTIONS: { value: BookStatus; label: string }[] = Object.entries(STATUS_LABEL).map(
  ([value, label]) => ({ value: value as BookStatus, label }),
)

/** Цвет точки статуса — совпадает с пилюлей статуса на BookCoverCard. */
const STATUS_DOT_COLOR: Record<BookStatus, string> = {
  WANT: '#999',
  READING: '#5aa0c8',
  DONE: 'var(--color-primary, #4e7b6a)',
  DROPPED: '#b94040',
}

/** Цвет шкалы оценки — фиксированный, не зависит от темы (как и везде в книгах). */
function scoreColor(rating: number): string {
  if (rating >= 8) return '#5e9b84'
  if (rating >= 6) return '#c49a3a'
  return '#b94040'
}

/**
 * Значения полей формы добавления/редактирования книги.
 */
interface BookFormValues {
  /** Название книги. */
  title: string
  /** Автор книги. */
  author: string
  /** URL обложки — сохраняется при редактировании, но не редактируется в этой форме. */
  coverUrl: string
  /** Количество страниц (строка из инпута, переводится в число при отправке). */
  pageCount: string
  /** Статус книги в списке пользователя. */
  status: BookStatus
  /** Оценка от 1 до 10 (строка из инпута, показывается при статусе «Прочитано»). */
  rating: string
  /** Текущая/прочитанная страница (строка из инпута). */
  progress: string
  /** Заметка пользователя. */
  notes: string
}

/** Начальные значения формы добавления книги. */
const DEFAULT_VALUES: BookFormValues = {
  title: '',
  author: '',
  coverUrl: '',
  pageCount: '',
  status: 'WANT',
  rating: '',
  progress: '',
  notes: '',
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
    progress: entry.progress !== null ? String(entry.progress) : '',
    notes: entry.notes ?? '',
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
 * Оценка показывается при статусе «Прочитано», прогресс — при «Читаю» (слайдер)
 * или «Брошено» (необязательный ввод прочитанных страниц).
 */
export const BookFormDialog = ({ open, onClose, entry }: BookFormDialogProps) => {
  const isEdit = !!entry
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [createBook] = useCreateBookMutation()
  const [createEntry] = useCreateEntryMutation()
  const [updateBook] = useUpdateBookMutation()
  const [updateEntry] = useUpdateEntryMutation()
  const [deleteEntry] = useDeleteEntryMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<BookFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const title = watch('title')
  const coverUrl = watch('coverUrl')
  const status = watch('status')
  const pageCount = watch('pageCount')
  const progress = watch('progress')

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

      // Поля сверх статуса — создание записи поддерживает только статус,
      // остальное донасыщаем отдельным PATCH (и при создании, и при редактировании).
      const extraDto: UpdateBookEntryDto = {
        ...(values.status === 'DONE' && values.rating && { rating: Number(values.rating) }),
        ...((values.status === 'READING' || values.status === 'DROPPED') &&
          values.progress && { progress: Number(values.progress) }),
        ...(values.notes.trim() && { notes: values.notes.trim() }),
      }

      if (entry) {
        await updateBook({ id: entry.book.id, dto: bookDto }).unwrap()
        await updateEntry({ id: entry.id, dto: { status: values.status, ...extraDto } }).unwrap()
      } else {
        const book = await createBook(bookDto).unwrap()
        const newEntry = await createEntry({ bookId: book.id, status: values.status }).unwrap()
        if (Object.keys(extraDto).length > 0) {
          await updateEntry({ id: newEntry.id, dto: extraDto }).unwrap()
        }
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

  /**
   * Удаление записи после подтверждения в отдельном диалоге.
   */
  const handleDeleteConfirmed = async () => {
    if (!entry) return
    try {
      await deleteEntry(entry.id).unwrap()
      setDeleteConfirmOpen(false)
      onClose()
    } catch {
      setDeleteConfirmOpen(false)
      setError('Не удалось удалить книгу. Попробуй ещё раз.')
    }
  }

  const hasPageCount = !!pageCount && Number(pageCount) > 0
  const showsProgress = (status === 'READING' || status === 'DROPPED') && hasPageCount

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ pr: 6 }}>
            {isEdit ? 'Редактировать книгу' : 'Добавить книгу'}
            <IconButton
              onClick={handleClose}
              disabled={isSubmitting}
              sx={{ position: 'absolute', right: 12, top: 12 }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 100,
                  flexShrink: 0,
                  aspectRatio: '2 / 3',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  p: 1,
                  ...(coverUrl
                    ? {
                        backgroundImage: `url(${coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {
                        background:
                          'linear-gradient(150deg, var(--color-primary, #4e7b6a), var(--color-primary-dark, #3a5c4f))',
                      }),
                }}
              >
                {!coverUrl && (
                  <Typography
                    variant="caption"
                    sx={{ color: '#fff', fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {title || 'Книга'}
                  </Typography>
                )}
              </Box>

              <Stack spacing={2} sx={{ flex: 1 }}>
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
                <TextField
                  label="Страниц"
                  type="number"
                  sx={{ width: 140 }}
                  {...register('pageCount')}
                />
              </Stack>
            </Stack>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                СТАТУС
              </Typography>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    {STATUS_OPTIONS.map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        onClick={() => field.onChange(option.value)}
                        variant={field.value === option.value ? 'filled' : 'outlined'}
                        icon={
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              ml: '8px !important',
                              borderRadius: '50%',
                              bgcolor: STATUS_DOT_COLOR[option.value],
                            }}
                          />
                        }
                      />
                    ))}
                  </Stack>
                )}
              />

              {(status === 'READING' || status === 'DROPPED') && !hasPageCount && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 2 }}
                >
                  Укажи количество страниц, чтобы отслеживать прогресс
                </Typography>
              )}

              {showsProgress && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Прочитано страниц
                  </Typography>
                  <Controller
                    name="progress"
                    control={control}
                    render={({ field }) => (
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                        <Slider
                          value={field.value ? Number(field.value) : 0}
                          min={0}
                          max={Number(pageCount)}
                          sx={{ flex: 1 }}
                          onChange={(_, value) => field.onChange(String(value))}
                        />
                        <TextField
                          type="number"
                          size="small"
                          sx={{ width: 90 }}
                          slotProps={{ htmlInput: { min: 0, max: Number(pageCount) } }}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </Stack>
                    )}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progress || 0} / {pageCount} стр.
                  </Typography>
                </Box>
              )}
            </Box>

            {status === 'DONE' && (
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  ОЦЕНКА
                </Typography>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => {
                    const ratingValue = field.value ? Number(field.value) : 0
                    return (
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ flexShrink: 0 }}
                        >
                          <Rating
                            value={ratingValue / 2}
                            precision={0.5}
                            max={5}
                            sx={{
                              '& .MuiRating-iconFilled': { color: scoreColor(ratingValue) },
                              '& .MuiRating-iconHover': { color: scoreColor(ratingValue) },
                            }}
                            onChange={(_, value) =>
                              field.onChange(value ? String(Math.round(value * 2)) : '')
                            }
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 44 }}>
                            {ratingValue || '—'} / 10
                          </Typography>
                        </Stack>
                        <Slider
                          value={ratingValue}
                          min={0}
                          max={10}
                          step={1}
                          sx={{ flex: 1 }}
                          onChange={(_, value) => field.onChange(String(value))}
                        />
                      </Stack>
                    )
                  }}
                />
              </Box>
            )}

            <TextField
              label="Заметка"
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 1 }}
              {...register('notes')}
            />

            {error && <Typography color="error">{error}</Typography>}
          </DialogContent>
          <DialogActions
            sx={{ px: 3, pb: 2.5, justifyContent: isEdit ? 'space-between' : 'flex-end' }}
          >
            {isEdit && (
              <Button
                color="error"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isSubmitting}
              >
                Удалить
              </Button>
            )}
            <Stack direction="row" spacing={1}>
              <Button onClick={handleClose} disabled={isSubmitting}>
                Отмена
              </Button>
              <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
                {isEdit ? 'Сохранить' : 'Добавить'}
              </Button>
            </Stack>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Удалить книгу?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Запись «{entry?.book.title}» будет удалена из библиотеки без возможности восстановления.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirmed}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
