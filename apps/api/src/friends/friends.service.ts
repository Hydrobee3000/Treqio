import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { Friendship } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { PUBLIC_USER_SELECT } from '../users/public-user'

/**
 * Сервис управления заявками в друзья и списком друзей.
 */
@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Отправляет заявку в друзья пользователю по username. Если адресат уже
   * отправил встречную заявку — вместо второй заявки сразу принимает её.
   */
  async sendRequest(senderId: string, username: string): Promise<Friendship> {
    const receiver = await this.prisma.user.findUnique({ where: { username } })
    if (!receiver) throw new NotFoundException('Пользователь не найден')
    if (receiver.id === senderId) throw new ConflictException('Нельзя добавить себя в друзья')

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: senderId },
        ],
      },
    })

    if (!existing) {
      return this.prisma.friendship.create({
        data: { senderId, receiverId: receiver.id, status: 'PENDING' },
      })
    }

    if (existing.status === 'ACCEPTED') {
      throw new ConflictException('Уже в друзьях')
    }

    if (existing.senderId === senderId) {
      throw new ConflictException('Заявка уже отправлена')
    }

    // existing.senderId === receiver.id — адресат уже отправил встречную
    // заявку, принимаем её вместо создания второй.
    return this.prisma.friendship.update({
      where: { id: existing.id },
      data: { status: 'ACCEPTED' },
    })
  }

  /**
   * Принимает входящую заявку в друзья.
   */
  async acceptRequest(userId: string, friendshipId: string): Promise<Friendship> {
    const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } })
    if (!friendship || friendship.receiverId !== userId) {
      throw new NotFoundException('Заявка не найдена')
    }
    if (friendship.status === 'ACCEPTED') {
      throw new ConflictException('Заявка уже принята')
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    })
  }

  /**
   * Отклоняет заявку или удаляет уже принятую дружбу — в обоих случаях
   * просто удаляет запись, доступно любой из двух сторон.
   */
  async removeFriendship(userId: string, friendshipId: string): Promise<void> {
    const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } })
    if (!friendship || (friendship.senderId !== userId && friendship.receiverId !== userId)) {
      throw new NotFoundException('Запись не найдена')
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } })
  }

  /**
   * Список принятых друзей пользователя.
   */
  async getFriends(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: PUBLIC_USER_SELECT },
        receiver: { select: PUBLIC_USER_SELECT },
      },
    })

    // Идентификатор связи отдаётся вместе с пользователем — без него клиент
    // не может удалить дружбу, а второго запроса ради этого делать не нужно.
    return rows.map((row) => ({
      friendshipId: row.id,
      user: row.senderId === userId ? row.receiver : row.sender,
    }))
  }

  /**
   * Идентификаторы друзей — для случаев, когда профили не нужны.
   */
  async getFriendIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: { senderId: true, receiverId: true },
    })

    return rows.map((row) => (row.senderId === userId ? row.receiverId : row.senderId))
  }

  /**
   * Входящие заявки в друзья, ожидающие решения пользователя.
   */
  getIncomingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: PUBLIC_USER_SELECT } },
    })
  }

  /**
   * Исходящие заявки в друзья, отправленные пользователем.
   */
  getOutgoingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: { receiver: { select: PUBLIC_USER_SELECT } },
    })
  }
}
