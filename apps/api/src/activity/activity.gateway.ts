import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { OnEvent } from '@nestjs/event-emitter'
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { ActivityType, EntriesVisibility } from '../generated/prisma/client'
import { FeedPreferencesService } from '../feed-preferences/feed-preferences.service'
import { FriendsService } from '../friends/friends.service'
import { ActivityService } from './activity.service'

/** Событие, которым `BooksService` сообщает шлюзу о новом событии журнала. */
export interface ActivityCreatedEvent {
  activityId: string
}

/** Комната пользователя — личный "почтовый ящик" для его сокет-соединений. */
function userRoom(userId: string): string {
  return `user:${userId}`
}

/**
 * WebSocket-шлюз ленты активности — уведомляет друзей автора о новом
 * событии в реальном времени, не дожидаясь ручного обновления страницы.
 */
@WebSocketGateway({
  cors: { origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000', credentials: true },
})
export class ActivityGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server

  private readonly logger = new Logger(ActivityGateway.name)

  constructor(
    private readonly jwt: JwtService,
    private readonly activityService: ActivityService,
    private readonly friendsService: FriendsService,
    private readonly feedPreferencesService: FeedPreferencesService,
  ) {}

  /**
   * Проверяет токен на подключении и присоединяет клиента к его личной
   * комнате — иначе соединение сразу закрывается.
   */
  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = this.authenticate(client)
    if (!userId) {
      client.disconnect()
      return
    }

    client.data['userId'] = userId
    void client.join(userRoom(userId))
  }

  /**
   * Достаёт и проверяет access-токен из handshake — тот же секрет, что и в REST.
   */
  private authenticate(client: Socket): string | null {
    const token =
      (client.handshake.auth['token'] as string | undefined) ??
      (client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') as string | undefined)
    if (!token) return null

    try {
      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: process.env['JWT_ACCESS_SECRET'],
      })
      return payload.sub
    } catch {
      return null
    }
  }

  /**
   * `BooksService` эмитит это событие сразу после успешного коммита
   * транзакции — до коммита рассылать нельзя, иначе можно разослать
   * событие, которое затем не сохранится.
   */
  @OnEvent('activity.created')
  async handleActivityCreated({ activityId }: ActivityCreatedEvent): Promise<void> {
    try {
      await this.broadcast(activityId)
    } catch (error) {
      // Рассылка — best-effort: если она упала, запись в журнале уже
      // сохранена и появится в ленте при следующей обычной загрузке.
      this.logger.error(`Failed to broadcast activity ${activityId}`, error)
    }
  }

  private async broadcast(activityId: string): Promise<void> {
    const activity = await this.activityService.findForBroadcast(activityId)
    if (!activity || activity.deletedAt) return
    if (activity.bookEntry?.isHidden || activity.bookEntry?.deletedAt) return

    // Переоценки в ленту не попадают — то же правило, что в `findFeed`.
    const ratingPayload = activity.payload as { previous?: number | null } | null
    if (activity.type === ActivityType.RATED && ratingPayload?.previous != null) return

    const { user: author } = activity
    if (author.entriesVisibility === EntriesVisibility.PRIVATE || !author.shareActivity) return

    const friendIds = await this.friendsService.getFriendIds(author.id)
    if (friendIds.length === 0) return

    const recipientIds = await this.feedPreferencesService.filterEligibleRecipients(
      author.id,
      friendIds,
    )
    if (recipientIds.length === 0) return

    // entriesVisibility/shareActivity — служебные поля только для проверки
    // выше, клиенту они не нужны и не должны попасть в ответ.
    const user = {
      id: author.id,
      username: author.username,
      displayName: author.displayName,
      avatarUrl: author.avatarUrl,
    }
    const payload = { ...activity, user }

    for (const recipientId of recipientIds) {
      this.server.to(userRoom(recipientId)).emit('feed:activity', payload)
    }
  }
}
