import { Module } from '@nestjs/common'
import { FriendsModule } from '../friends/friends.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'

/**
 * Модуль журнала активности пользователя.
 */
@Module({
  imports: [PrismaModule, UsersModule, FriendsModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
