import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

/** Максимальная длина отображаемого имени. */
export const DISPLAY_NAME_MAX = 25

/** Минимальная длина никнейма. */
export const USERNAME_MIN = 3

/** Максимальная длина никнейма. */
export const USERNAME_MAX = 30

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
  username?: string

  /** Краткое описание профиля, заполняется пользователем. */
  @ApiPropertyOptional({ description: 'Краткое описание профиля', maxLength: BIO_MAX })
  @IsOptional()
  @IsString()
  @MaxLength(BIO_MAX)
  bio?: string

  /** Публичность профиля — виден ли профиль другим пользователям. */
  @ApiPropertyOptional({ description: 'Публичность профиля' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
