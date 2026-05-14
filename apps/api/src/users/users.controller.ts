import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UsersService } from './users.service'

/**
 * Данные авторизованного пользователя из JWT-токена.
 */
interface JwtUser {
  /** Идентификатор пользователя. */
  userId: string
}

/**
 * Контроллер управления профилем текущего пользователя.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Возвращает профиль авторизованного пользователя.
   */
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @Get('me')
  getMe(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.usersService.getProfile(userId)
  }

  /**
   * Обновляет профиль авторизованного пользователя.
   */
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @Patch('me')
  updateMe(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const { userId } = req.user as JwtUser
    return this.usersService.updateProfile(userId, dto)
  }
}
