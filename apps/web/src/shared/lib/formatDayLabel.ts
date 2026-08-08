/**
 * Лейбл дня для события ленты/истории — «Сегодня», «Вчера» или дата в
 * локализованном формате.
 */
export function formatDayLabel(
  dateStr: string,
  lang: string,
  today: string,
  yesterday: string,
): string {
  const date = new Date(dateStr)
  const now = new Date()
  const prev = new Date(now)
  prev.setDate(now.getDate() - 1)
  if (date.toDateString() === now.toDateString()) return today
  if (date.toDateString() === prev.toDateString()) return yesterday
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
  })
}
