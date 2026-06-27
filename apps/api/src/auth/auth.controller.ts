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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import type { User } from '../generated/prisma/client'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

/**
 * Контроллер авторизации.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Редирект на страницу авторизации Google.
   * Passport перехватывает запрос и формирует URL сам — код метода не выполняется.
   */
  @ApiOperation({ summary: 'Редирект на страницу авторизации Google' })
  @ApiResponse({ status: 302, description: 'Редирект на Google OAuth' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {}

  /**
   * Обработка ответа от Google после авторизации пользователя.
   * Passport проверил code, получил профиль и положил пользователя в req.user.
   */
  @ApiOperation({ summary: 'Callback после авторизации через Google' })
  @ApiResponse({ status: 302, description: 'Редирект на фронтенд с accessToken' })
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
  @ApiOperation({ summary: 'Данные текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя' })
  @ApiResponse({ status: 401, description: 'Токен отсутствует или невалидный' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Обновление access token' })
  @ApiResponse({ status: 200, description: 'Новый access token' })
  @ApiResponse({ status: 401, description: 'Refresh token невалидный или истёк' })
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
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Cookie очищен' })
  @Post('logout')
  @HttpCode(200)
  logout(@Res() res: Response): void {
    res.clearCookie('refresh_token')
    res.json({ success: true })
  }
}
