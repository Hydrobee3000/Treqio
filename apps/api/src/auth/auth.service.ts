import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

/** Максимум попыток подобрать свободный случайный username. */
const USERNAME_GENERATION_MAX_ATTEMPTS = 10

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

    const username = await this.generateUniqueUsername()

    return this.prisma.user.create({
      data: {
        email: profile.email,
        username,
        displayName: profile.displayName,
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
   * Генерация случайного уникального username.
   */
  private async generateUniqueUsername(): Promise<string> {
    for (let attempt = 0; attempt < USERNAME_GENERATION_MAX_ATTEMPTS; attempt++) {
      const candidate = `user${Math.floor(Math.random() * 1_000_000_000)}`
      const existing = await this.prisma.user.findUnique({
        where: { username: candidate },
      })
      if (!existing) return candidate
    }
    throw new InternalServerErrorException('Не удалось сгенерировать уникальный username')
  }
}
