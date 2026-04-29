import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

/**
 * Корневой модуль приложения.
 * Все остальные модули (AuthModule, BooksModule и т.д.) будут импортироваться сюда.
 */
@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
