import { Injectable } from '@nestjs/common'
import { ActivitySubject, ActivityType } from '../generated/prisma/client'
import type { BookEntry, BookStatus, Prisma } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { ActivityPayloadMap } from './activity.payload'

/**
 * Клиент Prisma внутри транзакции — события журнала пишутся тем же клиентом,
 * что и само изменение записи, иначе они могут разойтись.
 */
type TransactionClient = Prisma.TransactionClient

/**
 * Приводит описанные подробности события к типу, который принимает Prisma.
 * В схеме `payload` объявлен как произвольный JSON, поэтому проверку имён
 * полей даёт только тип на входе — здесь она уже пройдена.
 */
function toJson<T extends ActivityType>(payload: ActivityPayloadMap[T]): Prisma.InputJsonValue {
  return payload as unknown as Prisma.InputJsonValue
}

/**
 * Сервис журнала активности.
 */
@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Запись события о добавлении книги в список.
   * Начальный статус сохраняется в событии — отдельное событие о смене
   * статуса при создании не нужно.
   */
  recordEntryAdded(tx: TransactionClient, entry: BookEntry) {
    return tx.activity.create({
      data: {
        userId: entry.userId,
        type: ActivityType.ENTRY_ADDED,
        subject: ActivitySubject.BOOK,
        bookEntryId: entry.id,
        payload: toJson<typeof ActivityType.ENTRY_ADDED>({ status: entry.status }),
        createdAt: entry.createdAt,
      },
    })
  }

  /**
   * Запись события о смене статуса книги.
   */
  recordStatusChanged(
    tx: TransactionClient,
    entry: BookEntry,
    from: BookStatus,
    to: BookStatus,
    at: Date,
  ) {
    return tx.activity.create({
      data: {
        userId: entry.userId,
        type: ActivityType.STATUS_CHANGED,
        subject: ActivitySubject.BOOK,
        bookEntryId: entry.id,
        payload: toJson<typeof ActivityType.STATUS_CHANGED>({ from, to }),
        createdAt: at,
      },
    })
  }

  /**
   * Запись события об оценке книги.
   */
  recordRated(
    tx: TransactionClient,
    entry: BookEntry,
    rating: number | null,
    previous: number | null,
    at: Date,
  ) {
    return tx.activity.create({
      data: {
        userId: entry.userId,
        type: ActivityType.RATED,
        subject: ActivitySubject.BOOK,
        bookEntryId: entry.id,
        payload: toJson<typeof ActivityType.RATED>({ rating, previous }),
        createdAt: at,
      },
    })
  }

  /**
   * Хронология событий по конкретной записи.
   */
  findByEntry(entryId: string) {
    return this.prisma.activity.findMany({
      where: { bookEntryId: entryId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }
}
