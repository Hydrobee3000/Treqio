import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import type { User } from '../generated/prisma/client'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UsersService } from './users.service'

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
  getMe(@Req() req: Request): Promise<User> {
    const user = req.user as User
    return this.usersService.getProfile(user.id)
  }

  /**
   * Обновляет профиль авторизованного пользователя.
   */
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @Patch('me')
  updateMe(@Req() req: Request, @Body() dto: UpdateProfileDto): Promise<User> {
    const user = req.user as User
    return this.usersService.updateProfile(user.id, dto)
  }
}
