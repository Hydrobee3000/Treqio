import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request, Response } from 'express'
import type { User } from '../generated/prisma/client'
import type { AuthService } from './auth.service'

/**
 * Контроллер авторизации.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Редирект на страницу авторизации Google.
   * Passport перехватывает запрос и формирует URL сам — код метода не выполняется.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  /**
   * Обработка ответа от Google после авторизации пользователя.
   * Passport проверил code, получил профиль и положил пользователя в req.user.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const user = req.user as User

    const accessToken = this.authService.generateAccessToken(user.id)
    const refreshToken = this.authService.generateRefreshToken(user.id)

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, // JS на фронтенде не может прочитать этот cookie
      secure: false, // true в продакшне (требует HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
    })

    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000'
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}`)
  }
}
