import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { FeedPreferencesController } from './feed-preferences.controller'
import { FeedPreferencesService } from './feed-preferences.service'

/**
 * Модуль настроек ленты активности.
 */
@Module({
  imports: [PrismaModule],
  controllers: [FeedPreferencesController],
  providers: [FeedPreferencesService],
  exports: [FeedPreferencesService],
})
export class FeedPreferencesModule {}
