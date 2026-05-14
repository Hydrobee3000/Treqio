import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Данные для обновления профиля пользователя.
 */
export class UpdateProfileDto {
  /** Отображаемое имя. */
  @ApiPropertyOptional({ description: 'Отображаемое имя' })
  displayName?: string

  /** Уникальный никнейм пользователя в URL профиля. */
  @ApiPropertyOptional({ description: 'Уникальный никнейм' })
  username?: string

  /** Краткое описание профиля, заполняется пользователем. */
  @ApiPropertyOptional({ description: 'Краткое описание профиля' })
  bio?: string

  /** Публичность профиля — виден ли профиль другим пользователям. */
  @ApiPropertyOptional({ description: 'Публичность профиля' })
  isPublic?: boolean
}
