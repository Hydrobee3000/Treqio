import { ApiPropertyOptional } from '@nestjs/swagger'

/**
 * Данные для обновления профиля пользователя.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Отображаемое имя' })
  displayName?: string

  @ApiPropertyOptional({ description: 'Уникальный никнейм' })
  username?: string

  @ApiPropertyOptional({ description: 'Краткое описание профиля' })
  bio?: string

  @ApiPropertyOptional({ description: 'Публичность профиля' })
  isPublic?: boolean
}
