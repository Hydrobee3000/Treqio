import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'
import { BookStatus } from '../generated/prisma/client'
import type { CreateBookDto } from './dto/create-book.dto'
import type { UpdateBookDto } from './dto/update-book.dto'
import type { CreateBookEntryDto } from './dto/create-book-entry.dto'
import type { UpdateBookEntryDto } from './dto/update-book-entry.dto'

/** Сколько дней удалённая запись хранится в корзине и доступна для восстановления. */
export const TRASH_RETENTION_DAYS = 30

/** Миллисекунд в сутках. */
const MS_IN_DAY = 24 * 60 * 60 * 1000

/**
 * Даты, которые проставляются автоматически при переходе записи в указанный
 * статус — начало чтения при «Читаю», начало и завершение при «Прочитано».
 */
function autoStatusDates(
  status: BookStatus | undefined,
  now: Date,
): { startDate?: Date; finishDate?: Date } {
  if (status === BookStatus.READING) return { startDate: now }
  if (status === BookStatus.DONE) return { startDate: now, finishDate: now }
  return {}
}

/**
 * Сервис управления книгами и записями пользователя.
 */
@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Получение списка всех книг.
   */
  findAllBooks() {
    return this.prisma.book.findMany({ orderBy: { createdAt: 'desc' } })
  }

  /**
   * Получение книги по ID.
   */
  async findBookById(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } })
    if (!book) throw new NotFoundException('Книга не найдена')
    return book
  }

  /**
   * Создание новой книги.
   */
  createBook(dto: CreateBookDto) {
    return this.prisma.book.create({ data: { ...dto, author: dto.author ?? '' } })
  }

  /**
   * Обновление книги по ID.
   */
  async updateBook(id: string, dto: UpdateBookDto) {
    await this.findBookById(id)
    return this.prisma.book.update({ where: { id }, data: dto })
  }

  /**
   * Удаление книги по ID.
   */
  async deleteBook(id: string) {
    await this.findBookById(id)
    return this.prisma.book.delete({ where: { id } })
  }

  /**
   * Получение всех записей пользователя.
   * Скрытые записи возвращаются только их владельцу, удалённые — никому.
   */
  findUserEntries(userId: string, includeHidden = true) {
    return this.prisma.bookEntry.findMany({
      where: { userId, deletedAt: null, ...(includeHidden ? {} : { isHidden: false }) },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Получение удалённых записей пользователя, доступных для восстановления.
   */
  findDeletedEntries(userId: string) {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * MS_IN_DAY)
    return this.prisma.bookEntry.findMany({
      where: { userId, deletedAt: { gte: cutoff } },
      include: { book: true },
      orderBy: { deletedAt: 'desc' },
    })
  }

  /**
   * Получение записей пользователя по никнейму при наличии доступа к ним.
   */
  async findEntriesByUsername(viewerId: string, username: string) {
    const user = await this.usersService.getUserForEntries(viewerId, username)
    return this.findUserEntries(user.id, user.id === viewerId)
  }

  /**
   * Создание записи о книге для пользователя.
   */
  createEntry(userId: string, dto: CreateBookEntryDto) {
    // createdAt и startDate/finishDate должны совпадать до миллисекунды, если
    // книга создаётся сразу со статусом «Читаю»/«Прочитано» — иначе на фронте
    // событие "добавил" и "начал читать" сортируются в случайном порядке
    // (DB-время @default(now()) и App-время new Date() — это две разные засечки).
    const now = new Date()
    const autoDates = autoStatusDates(dto.status, now)
    return this.prisma.bookEntry.create({
      data: { userId, ...dto, createdAt: now, ...autoDates },
      include: { book: true },
    })
  }

  /**
   * Обновление записи пользователя по ID.
   */
  async updateEntry(userId: string, entryId: string, dto: UpdateBookEntryDto) {
    const entry = await this.findOwnedEntry(userId, entryId)

    // now общий для autoDates и ratingUpdatedAt: если статус и оценка
    // меняются в одном запросе (например отметили книгу прочитанной сразу
    // с оценкой), finishDate и ratingUpdatedAt совпадут до миллисекунды —
    // на фронте по этому совпадению решают, показывать оценку отдельным
    // событием истории или как часть события «прочитал».
    const now = new Date()
    // Авто-дата проставляется только если статус меняется и дата ещё не задана
    // вручную — не перезаписывает уже существующие startDate/finishDate.
    const autoDates = autoStatusDates(dto.status, now)
    const ratingChanged = dto.rating !== undefined && dto.rating !== entry.rating
    const statusChanged = dto.status !== undefined && dto.status !== entry.status

    return this.prisma.bookEntry.update({
      where: { id: entryId },
      data: {
        ...dto,
        startDate: dto.startDate
          ? new Date(dto.startDate)
          : entry.startDate === null
            ? autoDates.startDate
            : undefined,
        finishDate: dto.finishDate
          ? new Date(dto.finishDate)
          : entry.finishDate === null
            ? autoDates.finishDate
            : undefined,
        ratingUpdatedAt: ratingChanged ? now : undefined,
        statusUpdatedAt: statusChanged ? now : undefined,
      },
      include: { book: true },
    })
  }

  /**
   * Удаление записи пользователя по ID — запись отправляется в корзину,
   * откуда её можно восстановить в течение срока хранения.
   */
  async deleteEntry(userId: string, entryId: string) {
    await this.findOwnedEntry(userId, entryId)
    return this.prisma.bookEntry.update({
      where: { id: entryId },
      data: { deletedAt: new Date() },
      include: { book: true },
    })
  }

  /**
   * Восстановление удалённой записи из корзины.
   */
  async restoreEntry(userId: string, entryId: string) {
    const entry = await this.prisma.bookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.userId !== userId || !entry.deletedAt) {
      throw new NotFoundException('Запись не найдена')
    }
    return this.prisma.bookEntry.update({
      where: { id: entryId },
      data: { deletedAt: null },
      include: { book: true },
    })
  }

  /**
   * Поиск активной записи, принадлежащей пользователю.
   * Удалённые записи считаются несуществующими.
   */
  private async findOwnedEntry(userId: string, entryId: string) {
    const entry = await this.prisma.bookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.userId !== userId || entry.deletedAt) {
      throw new NotFoundException('Запись не найдена')
    }
    return entry
  }
}
