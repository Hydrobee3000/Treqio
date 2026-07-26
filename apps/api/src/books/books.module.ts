import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { BookEntriesController } from './book-entries.controller'
import { BooksController } from './books.controller'
import { BooksService } from './books.service'

/**
 * Модуль управления книгами и записями пользователя.
 */
@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [BooksController, BookEntriesController],
  providers: [BooksService],
})
export class BooksModule {}
