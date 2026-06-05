import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { BookStatus } from '../../generated/prisma/client'

/**
 * Данные для добавления книги в список пользователя.
 */
export class CreateBookEntryDto {
  /** Идентификатор книги. */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookId!: string

  /** Начальный статус книги. */
  @ApiProperty({ enum: BookStatus })
  @IsEnum(BookStatus)
  status!: BookStatus
}
