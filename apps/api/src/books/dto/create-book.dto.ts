import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator'

/**
 * Данные для создания книги.
 */
export class CreateBookDto {
  /** Название книги. */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string

  /** Автор книги. */
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  author!: string

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
