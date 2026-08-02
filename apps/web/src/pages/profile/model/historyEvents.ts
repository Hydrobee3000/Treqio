import { ArrowRight, Check, Plus, RefreshCw, Star, X } from 'lucide-react'
import type { ComponentType } from 'react'
import type { BookEntry } from '@/entities/book'

/** Тип события в истории — выводится из текущих полей записи, без отдельного журнала действий. */
export type HistoryEventType = 'ADDED' | 'READING' | 'DONE' | 'DROPPED' | 'RATED' | 'STATUS'

/**
 * Событие истории — производное от одной записи BookEntry на конкретную дату.
 */
export interface HistoryEvent {
  /** Тип события. */
  type: HistoryEventType
  /** Дата события (ISO). */
  date: string
  /** Запись, на основе которой построено событие. */
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

/** Оценку изменили не в момент завершения книги — нужно отдельное событие. */
export function hasSeparateRatingEvent(entry: BookEntry): boolean {
  return !!entry.ratingUpdatedAt && entry.ratingUpdatedAt !== entry.finishDate
}

/**
 * Статус менялся в момент, не совпадающий с startDate/finishDate (например
 * откатили «Прочитано» обратно на «Читаю») — такой переход событиями
 * READING/DONE/DROPPED не покрывается, нужно отдельное общее событие.
 */
export function hasSeparateStatusEvent(entry: BookEntry): boolean {
  if (!entry.statusUpdatedAt) return false
  if (entry.statusUpdatedAt === entry.startDate) return false
  if (entry.statusUpdatedAt === entry.finishDate) return false
  return entry.status !== 'DROPPED'
}

/**
 * Книга создана сразу со статусом «Читаю»/«Прочитано»/«Брошено» — рядом есть
 * событие (начал читать/прочитал/забросил) с той же датой, оно уже называет
 * статус, поэтому «со статусом X» в тексте добавления было бы дублированием.
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
 * Порядок событий при одинаковой дате (книга создана сразу со статусом
 * «Читаю»/«Прочитано» — даты совпадают до миллисекунды) — более «продвинутое»
 * по читательскому пути событие показывается выше, как более актуальное.
 */
const HISTORY_TYPE_RANK: Record<HistoryEventType, number> = {
  ADDED: 0,
  READING: 1,
  DONE: 2,
  DROPPED: 2,
  RATED: 3,
  STATUS: 3,
}

/** Строит события истории из текущих полей записей — без отдельного журнала действий. */
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

/** Группирует отсортированные по дате события по дням. */
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
