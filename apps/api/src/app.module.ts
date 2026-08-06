import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { BooksModule } from './books/books.module'
import { FriendsModule } from './friends/friends.module'
import { ActivityModule } from './activity/activity.module'
import { FeedPreferencesModule } from './feed-preferences/feed-preferences.module'

/**
 * Корневой модуль приложения.
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    BooksModule,
    FriendsModule,
    ActivityModule,
    FeedPreferencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
