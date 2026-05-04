import { Injectable } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'

/**
 * Сервис авторизации.
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  /**
   * Генерация короткоживущего токена для запросов к API (15 минут).
   */
  generateAccessToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: process.env['JWT_ACCESS_SECRET'],
        expiresIn: '15m',
      },
    )
  }

  /**
   * Генерация долгоживущего токена для обновления access token (7 дней).
   */
  generateRefreshToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: process.env['JWT_REFRESH_SECRET'],
        expiresIn: '7d',
      },
    )
  }
}
