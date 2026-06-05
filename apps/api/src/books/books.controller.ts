import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BooksService } from './books.service'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'

/**
 * Контроллер управления книгами.
 */
@ApiTags('books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * Возвращает список всех книг.
   */
  @ApiOperation({ summary: 'Получить список книг' })
  @Get()
  findAll() {
    return this.booksService.findAllBooks()
  }

  /**
   * Возвращает книгу по ID.
   */
  @ApiOperation({ summary: 'Получить книгу по ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findBookById(id)
  }

  /**
   * Создаёт новую книгу.
   */
  @ApiOperation({ summary: 'Создать книгу' })
  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.booksService.createBook(dto)
  }

  /**
   * Обновляет книгу по ID.
   */
  @ApiOperation({ summary: 'Обновить книгу' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.updateBook(id, dto)
  }

  /**
   * Удаляет книгу по ID.
   */
  @ApiOperation({ summary: 'Удалить книгу' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.deleteBook(id)
  }
}
