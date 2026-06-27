import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BookStatus } from '../generated/prisma/client'
import type { CreateBookDto } from './dto/create-book.dto'
import type { UpdateBookDto } from './dto/update-book.dto'
import type { CreateBookEntryDto } from './dto/create-book-entry.dto'
import type { UpdateBookEntryDto } from './dto/update-book-entry.dto'

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
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.book.create({ data: dto })
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
   * Получение всех записей текущего пользователя.
   */
  findUserEntries(userId: string) {
    return this.prisma.bookEntry.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    })
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
    const entry = await this.prisma.bookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.userId !== userId) throw new NotFoundException('Запись не найдена')

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
   * Удаление записи пользователя по ID.
   */
  async deleteEntry(userId: string, entryId: string) {
    const entry = await this.prisma.bookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.userId !== userId) throw new NotFoundException('Запись не найдена')
    return this.prisma.bookEntry.delete({ where: { id: entryId } })
  }
}
