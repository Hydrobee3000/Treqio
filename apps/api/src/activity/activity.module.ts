import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { FeedPreferencesModule } from '../feed-preferences/feed-preferences.module'
import { FriendsModule } from '../friends/friends.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../users/users.module'
import { ActivityController } from './activity.controller'
import { ActivityGateway } from './activity.gateway'
import { ActivityService } from './activity.service'

/**
 * Модуль журнала активности пользователя.
 */
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    FriendsModule,
    FeedPreferencesModule,
    JwtModule.register({}),
  ],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityGateway],
  exports: [ActivityService],
})
export class ActivityModule {}
