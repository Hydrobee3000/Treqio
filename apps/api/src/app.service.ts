import { Injectable } from '@nestjs/common'

/**
 * Корневой сервис. Содержит бизнес-логику, не знает про HTTP.
 */
@Injectable()
export class AppService {
  health(): { status: string } {
    return { status: 'ok' }
  }
}
