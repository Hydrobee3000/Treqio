import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

interface JwtPayload {
  sub: string
}

/**
 * Стратегия проверки JWT из заголовка Authorization.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env['JWT_ACCESS_SECRET']
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined')

    super({
      // Достаём токен из заголовка Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    })
  }

  validate(payload: JwtPayload): { userId: string } {
    return { userId: payload.sub }
  }
}
