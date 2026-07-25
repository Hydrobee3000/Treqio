import { Injectable, ConflictException } from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { UpdateProfileDto } from './dto/update-profile.dto'

/** Код ошибки Prisma при нарушении unique-constraint. */
const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002'

/**
 * Сервис управления профилем пользователя.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получение профиля по ID.
   */
  async getProfile(userId: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } })
  }

  /**
   * Обновление профиля пользователя.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.username) {
      const taken = await this.prisma.user.findUnique({
        where: { username: dto.username },
      })
      if (taken && taken.id !== userId) {
        throw new ConflictException('Никнейм уже занят')
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
      })
    } catch (error) {
      // Страховка от гонки: два запроса одновременно проходят проверку выше
      // и оба пытаются занять один и тот же username — БД отклонит второй
      // по unique-constraint, отдаём тот же 409, а не сырую 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR
      ) {
        throw new ConflictException('Никнейм уже занят')
      }
      throw error
    }
  }
}
