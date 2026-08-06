import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { FeedPreferenceKind } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PUBLIC_USER_SELECT } from '../users/public-user'
import type { PublicUser } from '../users/public-user'

/**
 * Настройки ленты текущего пользователя.
 */
export interface FeedPreferences {
  /** Пользователи, чья активность не показывается в ленте владельца. */
  muted: PublicUser[]
  /** Пользователи, которым не показывается активность владельца. */
  hiddenFrom: PublicUser[]
}

/**
 * Сервис настроек ленты — заглушения других пользователей и скрытия от них.
 */
@Injectable()
export class FeedPreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Включение настройки. Повторный вызов ничего не меняет.
   */
  async setPreference(ownerId: string, targetId: string, kind: FeedPreferenceKind) {
    await this.assertTargetExists(ownerId, targetId)

    return this.prisma.feedPreference.upsert({
      where: { ownerId_targetId_kind: { ownerId, targetId, kind } },
      create: { ownerId, targetId, kind },
      update: {},
    })
  }

  /**
   * Выключение настройки. Отсутствие настройки ошибкой не считается.
   */
  async removePreference(
    ownerId: string,
    targetId: string,
    kind: FeedPreferenceKind,
  ): Promise<void> {
    await this.prisma.feedPreference.deleteMany({ where: { ownerId, targetId, kind } })
  }

  /**
   * Настройки, сделанные пользователем, вместе с профилями тех, кого они касаются.
   */
  async getPreferences(ownerId: string): Promise<FeedPreferences> {
    const rows = await this.prisma.feedPreference.findMany({
      where: { ownerId },
      include: { target: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    })

    return {
      muted: rows.filter((row) => row.kind === FeedPreferenceKind.MUTED).map((row) => row.target),
      hiddenFrom: rows
        .filter((row) => row.kind === FeedPreferenceKind.HIDDEN_FROM)
        .map((row) => row.target),
    }
  }

  /**
   * Идентификаторы пользователей, чьи события не попадают в ленту читателя:
   * заглушённые им самим и скрывшиеся от него.
   */
  async getExcludedAuthorIds(viewerId: string): Promise<string[]> {
    const rows = await this.prisma.feedPreference.findMany({
      where: {
        OR: [
          { ownerId: viewerId, kind: FeedPreferenceKind.MUTED },
          { targetId: viewerId, kind: FeedPreferenceKind.HIDDEN_FROM },
        ],
      },
      select: { ownerId: true, targetId: true, kind: true },
    })

    // В каждой строке исключается противоположная читателю сторона.
    return rows.map((row) => (row.kind === FeedPreferenceKind.MUTED ? row.targetId : row.ownerId))
  }

  /**
   * Проверка пользователя, на которого делается настройка.
   */
  private async assertTargetExists(ownerId: string, targetId: string): Promise<void> {
    if (ownerId === targetId) {
      throw new ConflictException('Нельзя настроить ленту на себя')
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    })
    if (!target) throw new NotFoundException('Пользователь не найден')
  }
}
