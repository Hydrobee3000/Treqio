import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { EntriesVisibility } from '../../generated/prisma/client'
import { RESERVED_USERNAMES } from '../reserved-usernames'

/** Максимальная длина отображаемого имени. */
export const DISPLAY_NAME_MAX = 25

/** Минимальная длина никнейма. */
export const USERNAME_MIN = 3

/** Максимальная длина никнейма. */
export const USERNAME_MAX = 20

/** Максимальная длина bio. */
export const BIO_MAX = 200

/**
 * Данные для обновления профиля пользователя.
 */
export class UpdateProfileDto {
  /** Отображаемое имя. */
  @ApiPropertyOptional({ description: 'Отображаемое имя', maxLength: DISPLAY_NAME_MAX })
  @IsOptional()
  @IsString()
  @MaxLength(DISPLAY_NAME_MAX)
  displayName?: string

  /** Уникальный никнейм пользователя в URL профиля. */
  @ApiPropertyOptional({
    description: 'Уникальный никнейм',
    minLength: USERNAME_MIN,
    maxLength: USERNAME_MAX,
  })
  @IsOptional()
  @IsString()
  @MinLength(USERNAME_MIN)
  @MaxLength(USERNAME_MAX)
  @Matches(/^[a-z0-9_]+$/, { message: 'Только строчные буквы, цифры и символ _' })
  @IsNotIn(RESERVED_USERNAMES, { message: 'Этот никнейм зарезервирован' })
  username?: string

  /** Краткое описание профиля, заполняется пользователем. */
  @ApiPropertyOptional({ description: 'Краткое описание профиля', maxLength: BIO_MAX })
  @IsOptional()
  @IsString()
  @MaxLength(BIO_MAX)
  bio?: string

  /** Кому видны записи пользователя. */
  @ApiPropertyOptional({ description: 'Кому видны записи', enum: EntriesVisibility })
  @IsOptional()
  @IsEnum(EntriesVisibility)
  entriesVisibility?: EntriesVisibility

  /** Попадает ли активность пользователя в ленты друзей. */
  @ApiPropertyOptional({ description: 'Делиться активностью с друзьями' })
  @IsOptional()
  @IsBoolean()
  shareActivity?: boolean
}
