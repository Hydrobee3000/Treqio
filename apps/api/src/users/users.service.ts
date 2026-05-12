import { Injectable, ConflictException } from '@nestjs/common'
import type { User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { UpdateProfileDto } from './dto/update-profile.dto'

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

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    })
  }
}
