import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

/**
 * Корневой контроллер. Обрабатывает HTTP-запросы и делегирует логику сервису.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /api/health — проверка работоспособности сервера
   */
  @Get('health')
  health(): { status: string } {
    return this.appService.health()
  }
}
