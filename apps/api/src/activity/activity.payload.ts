import { ActivityType } from '../generated/prisma/client'
import type { BookStatus } from '../generated/prisma/client'

/**
 * Подробности события о добавлении записи в список.
 */
export interface EntryAddedPayload {
  /** Статус, с которым запись была добавлена. */
  status: BookStatus
}

/**
 * Подробности события о смене статуса записи.
 */
export interface StatusChangedPayload {
  /** Статус до изменения. */
  from: BookStatus
  /** Статус после изменения. */
  to: BookStatus
}

/**
 * Подробности события об оценке записи.
 */
export interface RatedPayload {
  /** Новая оценка — null, если оценку сняли. */
  rating: number | null
  /** Оценка до изменения — null, если её не было. */
  previous: number | null
}

/**
 * Соответствие типа события и его подробностей.
 * Один и тот же тип используется при записи и при чтении журнала — иначе
 * расхождение в именах полей ничем не проверяется, т.к. в базе это
 * произвольный JSON.
 */
export interface ActivityPayloadMap {
  [ActivityType.ENTRY_ADDED]: EntryAddedPayload
  [ActivityType.STATUS_CHANGED]: StatusChangedPayload
  [ActivityType.RATED]: RatedPayload
}

/**
 * Подробности события любого типа.
 */
export type ActivityPayload = ActivityPayloadMap[keyof ActivityPayloadMap]
