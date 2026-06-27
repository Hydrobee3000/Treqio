import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import type { Profile } from 'passport-google-oauth20'
import { Strategy } from 'passport-google-oauth20'
import type { User } from '../../generated/prisma/client'
import { AuthService } from '../auth.service'

/**
 * Стратегия авторизации через Google OAuth 2.0.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    const clientID = process.env['GOOGLE_CLIENT_ID']
    const clientSecret = process.env['GOOGLE_CLIENT_SECRET']
    const callbackURL = process.env['GOOGLE_CALLBACK_URL']

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth env variables are not defined')
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      // Запрашиваем email и базовый профиль (имя, аватар)
      scope: ['email', 'profile'],
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<User> {
    return this.authService.findOrCreateGoogleUser({
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      displayName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    })
  }
}
