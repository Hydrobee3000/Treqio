import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { FeedPreferenceKind } from '../generated/prisma/client'
import { FeedPreferencesService } from './feed-preferences.service'

/**
 * Данные авторизованного пользователя из JWT-токена.
 */
interface JwtUser {
  /** Идентификатор пользователя. */
  userId: string
}

/**
 * Контроллер настроек ленты текущего пользователя.
 */
@ApiTags('feed-preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed-preferences')
export class FeedPreferencesController {
  constructor(private readonly feedPreferencesService: FeedPreferencesService) {}

  /**
   * Возвращает заглушённых пользователей и тех, от кого скрыта активность.
   */
  @ApiOperation({ summary: 'Настройки ленты' })
  @Get()
  getPreferences(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.feedPreferencesService.getPreferences(userId)
  }

  /**
   * Убирает активность пользователя из своей ленты.
   */
  @ApiOperation({ summary: 'Заглушить пользователя' })
  @Post('mute/:userId')
  mute(@Req() req: Request, @Param('userId') targetId: string) {
    const { userId } = req.user as JwtUser
    return this.feedPreferencesService.setPreference(userId, targetId, FeedPreferenceKind.MUTED)
  }

  /**
   * Возвращает активность пользователя в свою ленту.
   */
  @ApiOperation({ summary: 'Снять заглушение' })
  @Delete('mute/:userId')
  unmute(@Req() req: Request, @Param('userId') targetId: string) {
    const { userId } = req.user as JwtUser
    return this.feedPreferencesService.removePreference(userId, targetId, FeedPreferenceKind.MUTED)
  }

  /**
   * Убирает свою активность из ленты пользователя.
   */
  @ApiOperation({ summary: 'Скрыть свою активность от пользователя' })
  @Post('hide/:userId')
  hide(@Req() req: Request, @Param('userId') targetId: string) {
    const { userId } = req.user as JwtUser
    return this.feedPreferencesService.setPreference(
      userId,
      targetId,
      FeedPreferenceKind.HIDDEN_FROM,
    )
  }

  /**
   * Возвращает свою активность в ленту пользователя.
   */
  @ApiOperation({ summary: 'Снять скрытие своей активности' })
  @Delete('hide/:userId')
  unhide(@Req() req: Request, @Param('userId') targetId: string) {
    const { userId } = req.user as JwtUser
    return this.feedPreferencesService.removePreference(
      userId,
      targetId,
      FeedPreferenceKind.HIDDEN_FROM,
    )
  }
}
