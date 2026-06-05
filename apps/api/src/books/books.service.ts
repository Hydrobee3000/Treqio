import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateBookDto } from './dto/create-book.dto'
import type { UpdateBookDto } from './dto/update-book.dto'
import type { CreateBookEntryDto } from './dto/create-book-entry.dto'
import type { UpdateBookEntryDto } from './dto/update-book-entry.dto'

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
    return this.prisma.bookEntry.create({
      data: { userId, ...dto },
      include: { book: true },
    })
  }

  /**
   * Обновление записи пользователя по ID.
   */
  async updateEntry(userId: string, entryId: string, dto: UpdateBookEntryDto) {
    const entry = await this.prisma.bookEntry.findUnique({ where: { id: entryId } })
    if (!entry || entry.userId !== userId) throw new NotFoundException('Запись не найдена')
    return this.prisma.bookEntry.update({
      where: { id: entryId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        finishDate: dto.finishDate ? new Date(dto.finishDate) : undefined,
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
