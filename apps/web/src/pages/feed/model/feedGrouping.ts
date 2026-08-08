import type { FeedItem } from '@/features/activity'
import { formatDayLabel } from '@/shared/lib/formatDayLabel'

/** Группа событий ленты за один день — с готовым лейблом («Сегодня», «Вчера» или дата). */
export interface FeedDayGroup {
  /** Лейбл дня. */
  label: string
  /** События за этот день, от новых к старым. */
  items: FeedItem[]
}

/**
 * Режет уже отсортированную по дате ленту на группы по дням.
 */
export function groupFeedByDay(
  items: FeedItem[],
  lang: string,
  today: string,
  yesterday: string,
): FeedDayGroup[] {
  const groups: FeedDayGroup[] = []
  for (const item of items) {
    const label = formatDayLabel(item.createdAt, lang, today, yesterday)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.label === label) lastGroup.items.push(item)
    else groups.push({ label, items: [item] })
  }
  return groups
}
