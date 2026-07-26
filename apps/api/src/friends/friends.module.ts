import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'

/**
 * Модуль заявок в друзья и списка друзей.
 */
@Module({
  imports: [PrismaModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
