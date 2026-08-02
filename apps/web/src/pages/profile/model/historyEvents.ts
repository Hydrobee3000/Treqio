import { ArrowRight, Check, Plus, RefreshCw, Star, X } from 'lucide-react'
import type { ComponentType } from 'react'
import type { BookEntry } from '@/entities/book'

/**
 * В базе нет отдельного лога действий пользователя — вся лента истории на
 * этой странице каждый раз восстанавливается заново из дат-полей записи
 * (createdAt/startDate/finishDate/statusUpdatedAt/ratingUpdatedAt). Функции
 * в этом файле превращают набор записей (BookEntry[]) в список событий.
 */

/** Тип события в истории. */
export type HistoryEventType = 'ADDED' | 'READING' | 'DONE' | 'DROPPED' | 'RATED' | 'STATUS'

/**
 * Одно событие ленты — конкретное действие пользователя в конкретный момент
 * времени, выведенное из одного из дат-полей записи.
 */
export interface HistoryEvent {
  /** Тип события. */
  type: HistoryEventType
  /** Дата события (ISO). */
  date: string
  /** Запись, из даты которой выведено событие. */
  entry: BookEntry
}

/** Группа событий за один день — с готовым лейблом («Сегодня», «Вчера» или дата). */
export interface HistoryDayGroup {
  /** Лейбл дня. */
  label: string
  /** События за этот день, от новых к старым. */
  events: HistoryEvent[]
}

/** Иконка узла на таймлайне для каждого типа события. */
export const HISTORY_ICON: Record<HistoryEventType, ComponentType<{ size?: number }>> = {
  ADDED: Plus,
  READING: ArrowRight,
  DONE: Check,
  DROPPED: X,
  RATED: Star,
  STATUS: RefreshCw,
}

/**
 * Оценку поставили не в момент завершения книги, а отдельно, позже (например
 * перечитал через месяц и оценил). Тогда `ratingUpdatedAt` не совпадает с
 * `finishDate`, и оценке нужно своё отдельное событие RATED на ленте —
 * иначе она молча потеряется, т.к. обычно просто выводится внутри события DONE.
 */
export function hasSeparateRatingEvent(entry: BookEntry): boolean {
  return !!entry.ratingUpdatedAt && entry.ratingUpdatedAt !== entry.finishDate
}

/**
 * Статус поменяли не через обычный путь «начал/закончил/бросил» — например
 * пометили книгу «Прочитано», а потом вручную вернули на «Читаю». Такой
 * переход не описывается событиями READING/DONE/DROPPED (у каждого свой
 * фиксированный смысл), поэтому если `statusUpdatedAt` не совпадает ни с
 * `startDate`, ни с `finishDate` — нужно отдельное общее событие STATUS.
 * DROPPED сюда не относится — у него уже есть своё событие.
 */
export function hasSeparateStatusEvent(entry: BookEntry): boolean {
  if (!entry.statusUpdatedAt) return false
  if (entry.statusUpdatedAt === entry.startDate) return false
  if (entry.statusUpdatedAt === entry.finishDate) return false
  return entry.status !== 'DROPPED'
}

/**
 * Книгу добавили сразу с финальным статусом («Читаю»/«Прочитано»/«Брошено»),
 * а не через отдельное действие позже — тогда `createdAt` совпадает с
 * `startDate`/`finishDate`, и рядом уже есть событие READING/DONE/DROPPED,
 * которое и так называет статус. Функция говорит: не добавляй в текст
 * события ADDED фразу «со статусом X» — это было бы дублированием.
 */
export function hasAccompanyingCreationEvent(entry: BookEntry): boolean {
  if (entry.startDate === entry.createdAt) return true
  if (entry.finishDate === entry.createdAt) return true
  if (
    entry.status === 'DROPPED' &&
    (entry.statusUpdatedAt ?? entry.createdAt) === entry.createdAt
  ) {
    return true
  }
  return false
}

/**
 * Если книгу добавили сразу с финальным статусом, несколько событий получают
 * одинаковую дату до миллисекунды (createdAt === finishDate) — сортировки
 * по одной только дате недостаточно. Ранг разруливает такие ничьи: при
 * равных датах выше показывается событие, которое дальше по пути читателя
 * (оценил/сменил статус > прочитал/бросил > начал читать > добавил).
 */
const HISTORY_TYPE_RANK: Record<HistoryEventType, number> = {
  ADDED: 0,
  READING: 1,
  DONE: 2,
  DROPPED: 2,
  RATED: 3,
  STATUS: 3,
}

/**
 * Строит ленту событий по всем записям: для каждой записи независимо
 * проверяет, какие дата-поля заполнены, и добавляет соответствующие события
 * (от 1 до 4 на запись), затем сортирует всё вместе — сначала по дате
 * (новые сверху), при равенстве дат — по HISTORY_TYPE_RANK.
 */
export function buildHistoryEvents(entries: BookEntry[]): HistoryEvent[] {
  const events: HistoryEvent[] = []
  for (const entry of entries) {
    events.push({ type: 'ADDED', date: entry.createdAt, entry })
    if (entry.startDate) events.push({ type: 'READING', date: entry.startDate, entry })
    if (entry.finishDate) events.push({ type: 'DONE', date: entry.finishDate, entry })
    if (entry.status === 'DROPPED') {
      events.push({ type: 'DROPPED', date: entry.statusUpdatedAt ?? entry.createdAt, entry })
    }
    if (hasSeparateRatingEvent(entry)) {
      events.push({ type: 'RATED', date: entry.ratingUpdatedAt as string, entry })
    }
    if (hasSeparateStatusEvent(entry)) {
      events.push({ type: 'STATUS', date: entry.statusUpdatedAt as string, entry })
    }
  }
  return events.sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateDiff !== 0) return dateDiff
    return HISTORY_TYPE_RANK[b.type] - HISTORY_TYPE_RANK[a.type]
  })
}

/** Лейбл дня события — «Сегодня», «Вчера» или дата в локализованном формате. */
function formatDayLabel(dateStr: string, lang: string, today: string, yesterday: string): string {
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

/**
 * Режет уже отсортированную по дате ленту событий на группы по дням — под
 * сворачиваемые блоки «Сегодня»/«Вчера»/дата в таймлайне.
 */
export function groupEventsByDay(
  events: HistoryEvent[],
  lang: string,
  today: string,
  yesterday: string,
): HistoryDayGroup[] {
  const groups: HistoryDayGroup[] = []
  for (const event of events) {
    const label = formatDayLabel(event.date, lang, today, yesterday)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.label === label) lastGroup.events.push(event)
    else groups.push({ label, events: [event] })
  }
  return groups
}
