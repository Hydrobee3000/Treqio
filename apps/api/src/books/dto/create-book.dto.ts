import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator'

/** Максимальная длина названия книги — длиннее не вписывается в обложку карточки. */
export const BOOK_TITLE_MAX = 70

/**
 * Данные для создания книги.
 */
export class CreateBookDto {
  /** Название книги. */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOOK_TITLE_MAX)
  title!: string

  /** Автор книги. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string

  /** URL обложки. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverUrl?: string

  /** Описание книги. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  /** Количество страниц. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  pageCount?: number

  /** Жанры книги. */
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[]
}
