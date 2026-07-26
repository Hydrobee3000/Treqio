import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SendFriendRequestDto } from './dto/send-friend-request.dto'
import { FriendsService } from './friends.service'

/**
 * Данные авторизованного пользователя из JWT-токена.
 */
interface JwtUser {
  /** Идентификатор пользователя. */
  userId: string
}

/**
 * Контроллер заявок в друзья и списка друзей текущего пользователя.
 */
@ApiTags('friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Возвращает список принятых друзей.
   */
  @ApiOperation({ summary: 'Список друзей' })
  @Get()
  getFriends(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.friendsService.getFriends(userId)
  }

  /**
   * Возвращает входящие заявки в друзья.
   */
  @ApiOperation({ summary: 'Входящие заявки в друзья' })
  @Get('requests/incoming')
  getIncomingRequests(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.friendsService.getIncomingRequests(userId)
  }

  /**
   * Возвращает исходящие заявки в друзья.
   */
  @ApiOperation({ summary: 'Исходящие заявки в друзья' })
  @Get('requests/outgoing')
  getOutgoingRequests(@Req() req: Request) {
    const { userId } = req.user as JwtUser
    return this.friendsService.getOutgoingRequests(userId)
  }

  /**
   * Отправляет заявку в друзья пользователю по username.
   */
  @ApiOperation({ summary: 'Отправить заявку в друзья' })
  @Post('requests')
  sendRequest(@Req() req: Request, @Body() dto: SendFriendRequestDto) {
    const { userId } = req.user as JwtUser
    return this.friendsService.sendRequest(userId, dto.username)
  }

  /**
   * Принимает входящую заявку в друзья.
   */
  @ApiOperation({ summary: 'Принять заявку в друзья' })
  @Patch('requests/:id/accept')
  acceptRequest(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as JwtUser
    return this.friendsService.acceptRequest(userId, id)
  }

  /**
   * Отклоняет заявку или удаляет из друзей.
   */
  @ApiOperation({ summary: 'Отклонить заявку или удалить из друзей' })
  @Delete(':id')
  removeFriendship(@Req() req: Request, @Param('id') id: string) {
    const { userId } = req.user as JwtUser
    return this.friendsService.removeFriendship(userId, id)
  }
}
