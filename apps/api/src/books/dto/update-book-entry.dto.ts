import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { BookStatus } from '../../generated/prisma/client'

/** Максимальная длина заметки к книге. */
export const NOTES_MAX = 2000

/**
 * Данные для обновления записи о книге пользователя.
 */
export class UpdateBookEntryDto {
  /** Статус книги в списке. */
  @ApiPropertyOptional({ enum: BookStatus })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus

  /** Оценка от 1 до 10. */
  @ApiPropertyOptional({ minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number

  /** Текущая страница. */
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  progress?: number

  /** Дата начала чтения. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  /** Дата завершения чтения. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  finishDate?: string

  /** Заметки пользователя. */
  @ApiPropertyOptional({ maxLength: NOTES_MAX })
  @IsOptional()
  @IsString()
  @MaxLength(NOTES_MAX)
  notes?: string
}
