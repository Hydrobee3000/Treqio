import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request, Response } from 'express'
import type { User } from '../generated/prisma/client'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
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
      secure: process.env['NODE_ENV'] === 'production', // требует HTTPS в продакшне
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
    })

    const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000'
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}`)
  }

  /**
   * Данные текущего авторизованного пользователя.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request): Promise<User> {
    const { userId } = req.user as { userId: string }
    const user = await this.authService.getUserById(userId)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  /**
   * Выдача нового access token по refresh token из cookie.
   */
  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() req: Request): { accessToken: string } {
    const token: string = req.cookies?.['refresh_token'] ?? ''
    const userId = this.authService.verifyRefreshToken(token)
    return { accessToken: this.authService.generateAccessToken(userId) }
  }

  /**
   * Выход из системы — очистка refresh token cookie.
   */
  @Post('logout')
  @HttpCode(200)
  logout(@Res() res: Response): void {
    res.clearCookie('refresh_token')
    res.json({ success: true })
  }
}
