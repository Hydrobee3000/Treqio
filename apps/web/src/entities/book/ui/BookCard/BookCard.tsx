import { Card, CardContent, CardMedia, Box, Typography, Chip } from '@mui/material'
import { lighten, darken } from '@mui/material/styles'
import { BookOpen, Star } from 'lucide-react'
import type { BookEntry, BookStatus } from '../../model/book.types'

const COVER_HEIGHT = 170

const STATUS_LABEL: Record<BookStatus, string> = {
  WANT: 'Хочу прочитать',
  READING: 'Читаю',
  DONE: 'Прочитал',
  DROPPED: 'Брошено',
}

const STATUS_COLOR: Record<BookStatus, 'default' | 'info' | 'success' | 'error'> = {
  WANT: 'default',
  READING: 'info',
  DONE: 'success',
  DROPPED: 'error',
}

/**
 * Пропсы BookCard.
 */
interface BookCardProps {
  /** Запись пользователя с данными книги. */
  entry: BookEntry
  /** Клик по карточке — открывает редактирование записи. */
  onClick?: () => void
}

/**
 * Карточка книги для отображения в библиотеке.
 */
export const BookCard = ({ entry, onClick }: BookCardProps) => {
  const { book, status, rating } = entry

  return (
    <Card
      onClick={onClick}
      sx={(theme) => ({
        width: 160,
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0px 2px 6px rgba(0,0,0,0.5)'
            : '0px 2px 6px rgba(0,0,0,0.1)',
        '&:hover': {
          // Тень от наведения слабо заметна на любом фоне (особенно тёмном),
          // поэтому основной сигнал — это подсветка рамки акцентным цветом
          // и небольшой подъём карточки, а не сама тень.
          transform: 'translateY(-3px)',
          borderColor: 'primary.main',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0px 6px 14px rgba(0,0,0,0.6)'
              : '0px 6px 14px rgba(0,0,0,0.2)',
        },
      })}
    >
      {book.coverUrl ? (
        <CardMedia
          component="img"
          image={book.coverUrl}
          alt={book.title}
          sx={{ height: COVER_HEIGHT, objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={(theme) => ({
            height: COVER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Фон плейсхолдера считаем от цвета самой карточки, а не берём
            // готовый токен темы — так гарантированный контраст с CardContent
            // есть в любой из 12 палитр, а не только там где divider удачно лёг.
            bgcolor:
              theme.palette.mode === 'dark'
                ? lighten(theme.palette.background.paper, 0.12)
                : darken(theme.palette.background.paper, 0.05),
            color: 'text.disabled',
          })}
        >
          <BookOpen size={48} strokeWidth={1} />
        </Box>
      )}

      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 0.75 } }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            // Резервируем высоту ровно на 2 строки независимо от длины названия —
            // иначе короткие названия в одну строку сдвигают автора и статус выше,
            // и карточки с разными названиями выглядят по-разному.
            minHeight: '2.6em',
            mb: 0.5,
          }}
        >
          {book.title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: 'block', mb: 1 }}
        >
          {book.author}
        </Typography>

        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}
        >
          <Chip label={STATUS_LABEL[status]} color={STATUS_COLOR[status]} size="small" />
          {rating !== null && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                color: 'warning.main',
                flexShrink: 0,
              }}
            >
              <Star size={12} fill="currentColor" />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {rating}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
