import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BooksService } from './books.service'
import { CreateBookEntryDto } from './dto/create-book-entry.dto'
import { UpdateBookEntryDto } from './dto/update-book-entry.dto'

/**
 * Данные авторизованного пользователя из JWT-токена.
 */
interface JwtUser {
  /** Идентификатор пользователя. */
  userId: string
}

/**
 * Контроллер управления записями пользователя о книгах.
 */
@ApiTags('book-entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books/entries')
export class BookEntriesController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * Возвращает все записи текущего пользователя.
   */
  @ApiOperation({ summary: 'Получить записи текущего пользователя' })
  @Get('me')
  findMine(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.booksService.findUserEntries(userId)
  }

  /**
   * Создаёт запись о книге для текущего пользователя.
   */
  @ApiOperation({ summary: 'Добавить книгу в список' })
  @Post()
  create(@Req() req: Request, @Body() dto: CreateBookEntryDto) {
    const { userId } = req.user as JwtUser
    return this.booksService.createEntry(userId, dto)
  }

  /**
   * Обновляет запись текущего пользователя по ID.
   */
  @ApiOperation({ summary: 'Обновить запись о книге' })
  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateBookEntryDto) {
    const { userId } = req.user as JwtUser
    return this.booksService.updateEntry(userId, id, dto)
  }

  /**
   * Удаляет запись текущего пользователя по ID.
   */
  @ApiOperation({ summary: 'Удалить запись о книге' })
  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as JwtUser
    return this.booksService.deleteEntry(userId, id)
  }
}
