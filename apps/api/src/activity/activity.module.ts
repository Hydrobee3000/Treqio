import { Module } from '@nestjs/common'
import { FeedPreferencesModule } from '../feed-preferences/feed-preferences.module'
import { FriendsModule } from '../friends/friends.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'

/**
 * Модуль журнала активности пользователя.
 */
@Module({
  imports: [PrismaModule, UsersModule, FriendsModule, FeedPreferencesModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
