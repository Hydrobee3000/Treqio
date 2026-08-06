import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ActivityService } from './activity.service'

/**
 * Данные авторизованного пользователя из JWT-токена.
 */
interface JwtUser {
  /** Идентификатор пользователя. */
  userId: string
}

/**
 * Контроллер журнала активности.
 */
@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  /**
   * Возвращает ленту событий текущего пользователя.
   */
  @ApiOperation({ summary: 'Получить свою активность' })
  @Get('me')
  findMine(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.activityService.findByUser(userId, userId)
  }

  /**
   * Возвращает ленту событий пользователя по никнейму.
   */
  @ApiOperation({ summary: 'Получить активность пользователя' })
  @Get('user/:username')
  findByUsername(@Req() req: Request, @Param('username') username: string) {
    const { userId } = req.user as JwtUser
    return this.activityService.findByUsername(userId, username)
  }
}
