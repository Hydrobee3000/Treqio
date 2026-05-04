import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Guard для защиты маршрутов — проверяет JWT из заголовка Authorization.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
