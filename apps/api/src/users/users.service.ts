import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '../generated/prisma/client'
import type { EntriesVisibility, User } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { UpdateProfileDto } from './dto/update-profile.dto'
import { PUBLIC_USER_SELECT } from './public-user'
import type { PublicUser } from './public-user'

/** Код ошибки Prisma при нарушении unique-constraint. */
const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002'

/** Минимальная длина поискового запроса. */
const SEARCH_QUERY_MIN_LENGTH = 2

/** Максимальное количество пользователей в результатах поиска. */
const SEARCH_RESULT_LIMIT = 20

/**
 * Состояние связи между просматривающим и просматриваемым пользователем.
 */
export type FriendshipState = 'NONE' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'FRIENDS'

/**
 * Связь между двумя пользователями с точки зрения просматривающего.
 */
interface FriendshipView {
  /** Состояние связи. */
  state: FriendshipState
  /** Идентификатор заявки — null, если связи нет. */
  friendshipId: string | null
}

/**
 * Проверка доступа к записям пользователя по его настройке видимости.
 */
function canViewEntries(
  visibility: EntriesVisibility,
  isOwner: boolean,
  state: FriendshipState,
): boolean {
  if (isOwner) return true
  if (visibility === 'PUBLIC') return true
  if (visibility === 'FRIENDS') return state === 'FRIENDS'
  return false
}

/**
 * Профиль другого пользователя вместе с состоянием связи с ним.
 */
export interface PublicProfile extends PublicUser {
  /** Состояние связи с просматривающим. */
  friendshipState: FriendshipState
  /** Идентификатор заявки — null, если связи нет. */
  friendshipId: string | null
  /** Флаг доступности записей просматривающему. */
  canViewEntries: boolean
}

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

  /**
   * Получение профиля другого пользователя по никнейму.
   */
  async getPublicProfile(viewerId: string, username: string): Promise<PublicProfile> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: PUBLIC_USER_SELECT,
    })
    if (!user) throw new NotFoundException('Пользователь не найден')

    const { state, friendshipId } = await this.getFriendshipView(viewerId, user.id)

    return {
      ...user,
      friendshipState: state,
      friendshipId,
      canViewEntries: canViewEntries(user.entriesVisibility, user.id === viewerId, state),
    }
  }

  /**
   * Получение пользователя по никнейму при наличии доступа к его записям.
   */
  async getUserForEntries(viewerId: string, username: string): Promise<PublicProfile> {
    const profile = await this.getPublicProfile(viewerId, username)
    if (!profile.canViewEntries) {
      throw new ForbiddenException('Профиль закрыт')
    }
    return profile
  }

  /**
   * Проверка доступа к записям пользователя по идентификаторам.
   * Нужна там, где известен владелец записи, но не его никнейм.
   */
  async canViewUserEntries(viewerId: string, ownerId: string): Promise<boolean> {
    if (viewerId === ownerId) return true

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { entriesVisibility: true },
    })
    if (!owner) return false

    const { state } = await this.getFriendshipView(viewerId, ownerId)
    return canViewEntries(owner.entriesVisibility, false, state)
  }

  /**
   * Поиск пользователей по никнейму и отображаемому имени.
   */
  async searchUsers(viewerId: string, query: string): Promise<PublicUser[]> {
    const trimmed = query.trim()
    if (trimmed.length < SEARCH_QUERY_MIN_LENGTH) return []

    return this.prisma.user.findMany({
      where: {
        id: { not: viewerId },
        OR: [
          { username: { startsWith: trimmed, mode: 'insensitive' } },
          { displayName: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      select: PUBLIC_USER_SELECT,
      take: SEARCH_RESULT_LIMIT,
      orderBy: { username: 'asc' },
    })
  }

  /**
   * Определение состояния связи между двумя пользователями.
   */
  private async getFriendshipView(viewerId: string, targetId: string): Promise<FriendshipView> {
    if (viewerId === targetId) return { state: 'NONE', friendshipId: null }

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: viewerId, receiverId: targetId },
          { senderId: targetId, receiverId: viewerId },
        ],
      },
    })

    if (!friendship) return { state: 'NONE', friendshipId: null }
    if (friendship.status === 'ACCEPTED') {
      return { state: 'FRIENDS', friendshipId: friendship.id }
    }
    return {
      state: friendship.senderId === viewerId ? 'REQUEST_SENT' : 'REQUEST_RECEIVED',
      friendshipId: friendship.id,
    }
  }
}
