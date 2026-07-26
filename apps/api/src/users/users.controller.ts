import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
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
 * Контроллер профилей пользователей.
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

  /**
   * Возвращает пользователей, подходящих под поисковый запрос.
   */
  @ApiOperation({ summary: 'Поиск пользователей' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: false })
  @Get('search')
  search(@Req() req: Request, @Query('q') q?: string) {
    const { userId } = req.user as JwtUser
    return this.usersService.searchUsers(userId, q ?? '')
  }

  /**
   * Возвращает профиль пользователя по никнейму.
   */
  // Объявляется последним: параметрический маршрут иначе перехватывает
  // GET-запросы к 'me' и 'search'.
  @ApiOperation({ summary: 'Получить профиль пользователя по никнейму' })
  @Get(':username')
  getByUsername(@Req() req: Request, @Param('username') username: string) {
    const { userId } = req.user as JwtUser
    return this.usersService.getPublicProfile(userId, username)
  }
}
