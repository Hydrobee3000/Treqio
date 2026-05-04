import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'
import type { User } from '../generated/prisma/client'
import type { PrismaService } from '../prisma/prisma.service'

/**
 * Данные профиля пользователя, полученные от Google OAuth.
 */
interface GoogleProfile {
  /** Уникальный ID пользователя на стороне Google. */
  googleId: string
  /** Основной email аккаунта. */
  email: string
  /** Отображаемое имя пользователя. */
  displayName: string
  /** URL аватара, может отсутствовать. */
  avatarUrl: string | null
}

/**
 * Сервис авторизации.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

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

  /**
   * Поиск существующего пользователя по Google-аккаунту или создание нового.
   */
  async findOrCreateGoogleUser(profile: GoogleProfile): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: profile.googleId,
        },
      },
    })

    if (existing) return existing

    const username = await this.generateUniqueUsername(profile.email.split('@')[0])

    return this.prisma.user.create({
      data: {
        email: profile.email,
        displayName: profile.displayName,
        username,
        avatarUrl: profile.avatarUrl,
        provider: 'google',
        providerId: profile.googleId,
      },
    })
  }

  /**
   * Поиск пользователя по ID.
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } })
  }

  /**
   * Проверка refresh token и извлечение userId из payload.
   */
  verifyRefreshToken(token: string): string {
    try {
      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: process.env['JWT_REFRESH_SECRET'],
      })
      return payload.sub
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  /**
   * Генерация уникального username на основе email-префикса.
   */
  private async generateUniqueUsername(base: string): Promise<string> {
    const clean = base.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const existing = await this.prisma.user.findUnique({
      where: { username: clean },
    })
    if (!existing) return clean
    // Добавляем короткий случайный суффикс если username занят
    return `${clean}_${Date.now().toString(36)}`
  }
}
