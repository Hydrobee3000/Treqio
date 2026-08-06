import { Injectable, NotFoundException } from '@nestjs/common'
import {
  ActivitySubject,
  ActivityType,
  EntriesVisibility,
  Prisma,
} from '../generated/prisma/client'
import type { BookEntry, BookStatus } from '../generated/prisma/client'
import { FeedPreferencesService } from '../feed-preferences/feed-preferences.service'
import { FriendsService } from '../friends/friends.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'
import type { ActivityPayloadMap } from './activity.payload'

/** Сколько событий отдаётся в одной порции ленты. */
export const FEED_PAGE_SIZE = 20

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly friendsService: FriendsService,
    private readonly feedPreferencesService: FeedPreferencesService,
  ) {}

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
   * Лента событий друзей, от новых к старым, порциями.
   *
   * Видимость упрощается тем, что в ленте и так только друзья: настройки
   * «всем» и «только друзьям» дают одинаковый результат, отличается лишь
   * «только мне» — такие пользователи из ленты выпадают целиком.
   */
  async findFeed(viewerId: string, cursor?: string, limit = FEED_PAGE_SIZE) {
    const friendIds = await this.friendsService.getFriendIds(viewerId)
    if (friendIds.length === 0) return { items: [], nextCursor: null }

    const excluded = new Set(await this.feedPreferencesService.getExcludedAuthorIds(viewerId))
    const candidateIds = friendIds.filter((id) => !excluded.has(id))
    if (candidateIds.length === 0) return { items: [], nextCursor: null }

    const authors = await this.prisma.user.findMany({
      where: {
        id: { in: candidateIds },
        entriesVisibility: { not: EntriesVisibility.PRIVATE },
        shareActivity: true,
      },
      select: { id: true },
    })
    if (authors.length === 0) return { items: [], nextCursor: null }

    // Берём на одну запись больше запрошенного: если она есть, значит лента
    // не кончилась и клиенту нужно отдать курсор для следующей порции.
    const rows = await this.prisma.activity.findMany({
      where: {
        userId: { in: authors.map((a) => a.id) },
        deletedAt: null,
        bookEntry: { isHidden: false, deletedAt: null },
        // Повторные оценки в ленту не идут: у первой оценки предыдущего
        // значения нет, у переоценки оно заполнено.
        OR: [
          { type: { not: ActivityType.RATED } },
          { payload: { path: ['previous'], equals: Prisma.JsonNull } },
        ],
      },
      include: {
        bookEntry: { include: { book: true } },
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = rows.length > limit
    const items = hasMore ? rows.slice(0, limit) : rows

    return {
      items,
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    }
  }

  /**
   * Удаление события из ленты — само событие остаётся и может быть восстановлено.
   */
  async deleteEvent(userId: string, activityId: string) {
    await this.findOwnEvent(userId, activityId, false)
    return this.prisma.activity.update({
      where: { id: activityId },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Возврат ранее удалённого события в ленту.
   */
  async restoreEvent(userId: string, activityId: string) {
    await this.findOwnEvent(userId, activityId, true)
    return this.prisma.activity.update({
      where: { id: activityId },
      data: { deletedAt: null },
    })
  }

  /**
   * Поиск своего события в нужном состоянии.
   * Чужое событие считается несуществующим — по ответу нельзя выяснить,
   * что оно есть у кого-то другого.
   */
  private async findOwnEvent(userId: string, activityId: string, expectDeleted: boolean) {
    const event = await this.prisma.activity.findUnique({ where: { id: activityId } })
    const isDeleted = !!event?.deletedAt

    if (!event || event.userId !== userId || isDeleted !== expectDeleted) {
      throw new NotFoundException('Событие не найдено')
    }
    return event
  }

  /**
   * Лента событий пользователя по его никнейму.
   */
  async findByUsername(viewerId: string, username: string) {
    const owner = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })
    if (!owner) throw new NotFoundException('Пользователь не найден')

    return this.findByUser(viewerId, owner.id)
  }

  /**
   * Лента событий пользователя для его профиля.
   * Скрытые записи ведут себя как в библиотеке: владелец видит события по ним,
   * остальные нет. События удалённых записей не отдаются никому.
   */
  async findByUser(viewerId: string, ownerId: string) {
    const allowed = await this.usersService.canViewUserEntries(viewerId, ownerId)
    if (!allowed) throw new NotFoundException('Профиль не найден')

    const isOwner = viewerId === ownerId

    return this.prisma.activity.findMany({
      where: {
        userId: ownerId,
        deletedAt: null,
        bookEntry: { deletedAt: null, ...(isOwner ? {} : { isHidden: false }) },
      },
      include: { bookEntry: { include: { book: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Хронология событий по конкретной записи.
   * Скрытая, удалённая и недоступная запись считается несуществующей —
   * иначе по ответу можно было бы узнать о её существовании.
   */
  async findByEntry(viewerId: string, entryId: string) {
    const entry = await this.prisma.bookEntry.findUnique({
      where: { id: entryId },
      select: { userId: true, isHidden: true, deletedAt: true },
    })
    if (!entry || entry.deletedAt) throw new NotFoundException('Запись не найдена')

    if (entry.userId !== viewerId) {
      const allowed = await this.usersService.canViewUserEntries(viewerId, entry.userId)
      if (!allowed || entry.isHidden) throw new NotFoundException('Запись не найдена')
    }

    return this.prisma.activity.findMany({
      where: { bookEntryId: entryId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }
}
