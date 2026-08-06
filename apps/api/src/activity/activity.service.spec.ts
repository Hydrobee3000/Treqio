import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ActivityService, FEED_PAGE_SIZE } from './activity.service'
import { FriendsService } from '../friends/friends.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'

describe('ActivityService', () => {
  let service: ActivityService
  let prisma: {
    bookEntry: { findUnique: jest.Mock }
    activity: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock }
    user: { findUnique: jest.Mock; findMany: jest.Mock }
  }
  let usersService: { canViewUserEntries: jest.Mock }
  let friendsService: { getFriendIds: jest.Mock }

  /** Чужая запись, открытая для просмотра. */
  const foreignEntry = { userId: 'user-2', isHidden: false, deletedAt: null }

  beforeEach(async () => {
    prisma = {
      bookEntry: { findUnique: jest.fn() },
      activity: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      user: { findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    }
    usersService = { canViewUserEntries: jest.fn().mockResolvedValue(true) }
    friendsService = { getFriendIds: jest.fn().mockResolvedValue([]) }

    const module = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
        { provide: FriendsService, useValue: friendsService },
      ],
    }).compile()

    service = module.get(ActivityService)
  })

  describe('findByUser', () => {
    it('отдаёт владельцу события в том числе по скрытым книгам', async () => {
      await service.findByUser('user-1', 'user-1')

      const where = prisma.activity.findMany.mock.calls[0][0].where as {
        bookEntry: Record<string, unknown>
      }
      expect(where.bookEntry).toEqual({ deletedAt: null })
    })

    it('прячет от чужого события по скрытым книгам', async () => {
      await service.findByUser('user-1', 'user-2')

      const where = prisma.activity.findMany.mock.calls[0][0].where as {
        bookEntry: Record<string, unknown>
      }
      expect(where.bookEntry).toEqual({ deletedAt: null, isHidden: false })
    })

    it('не отдаёт ленту закрытого профиля', async () => {
      usersService.canViewUserEntries.mockResolvedValueOnce(false)

      await expect(service.findByUser('user-1', 'user-2')).rejects.toThrow(NotFoundException)
      expect(prisma.activity.findMany).not.toHaveBeenCalled()
    })

    it('никому не отдаёт события удалённых записей', async () => {
      await service.findByUser('user-1', 'user-1')

      const where = prisma.activity.findMany.mock.calls[0][0].where as {
        deletedAt: null
        bookEntry: { deletedAt: null }
      }
      expect(where.deletedAt).toBeNull()
      expect(where.bookEntry.deletedAt).toBeNull()
    })
  })

  describe('findFeed', () => {
    /** Готовит ленту с указанным числом событий у одного друга. */
    const withEvents = (count: number) => {
      friendsService.getFriendIds.mockResolvedValueOnce(['friend-1'])
      prisma.user.findMany.mockResolvedValueOnce([{ id: 'friend-1' }])
      prisma.activity.findMany.mockResolvedValueOnce(
        Array.from({ length: count }, (_, i) => ({ id: `act-${i}` })),
      )
    }

    it('возвращает пустую ленту, если друзей нет', async () => {
      friendsService.getFriendIds.mockResolvedValueOnce([])

      const result = await service.findFeed('user-1')

      expect(result).toEqual({ items: [], nextCursor: null })
      expect(prisma.activity.findMany).not.toHaveBeenCalled()
    })

    it('исключает друзей, закрывших свои записи', async () => {
      friendsService.getFriendIds.mockResolvedValueOnce(['friend-1'])
      prisma.user.findMany.mockResolvedValueOnce([])

      const result = await service.findFeed('user-1')

      expect(result.items).toEqual([])
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['friend-1'] }, entriesVisibility: { not: 'PRIVATE' } },
        }),
      )
      expect(prisma.activity.findMany).not.toHaveBeenCalled()
    })

    it('не отдаёт события скрытых и удалённых книг', async () => {
      withEvents(1)

      await service.findFeed('user-1')

      const where = prisma.activity.findMany.mock.calls[0][0].where as {
        deletedAt: null
        bookEntry: { isHidden: boolean; deletedAt: null }
      }
      expect(where.deletedAt).toBeNull()
      expect(where.bookEntry).toEqual({ isHidden: false, deletedAt: null })
    })

    it('исключает повторные оценки', async () => {
      withEvents(1)

      await service.findFeed('user-1')

      const where = prisma.activity.findMany.mock.calls[0][0].where as { OR: unknown[] }
      // Первая оценка отличается от переоценки тем, что предыдущего значения нет.
      expect(where.OR).toHaveLength(2)
    })

    it('не отдаёт курсор, когда лента закончилась', async () => {
      withEvents(3)

      const result = await service.findFeed('user-1')

      expect(result.items).toHaveLength(3)
      expect(result.nextCursor).toBeNull()
    })

    it('отдаёт курсор и обрезает лишнее, когда есть продолжение', async () => {
      withEvents(FEED_PAGE_SIZE + 1)

      const result = await service.findFeed('user-1')

      expect(result.items).toHaveLength(FEED_PAGE_SIZE)
      expect(result.nextCursor).toBe(`act-${FEED_PAGE_SIZE - 1}`)
    })

    it('продолжает ленту с переданного курсора, не повторяя его', async () => {
      withEvents(1)

      await service.findFeed('user-1', 'act-5')

      const args = prisma.activity.findMany.mock.calls[0][0] as {
        cursor: { id: string }
        skip: number
      }
      expect(args.cursor).toEqual({ id: 'act-5' })
      expect(args.skip).toBe(1)
    })

    it('сортирует по дате, а при совпадении — по идентификатору', async () => {
      withEvents(1)

      await service.findFeed('user-1')

      const args = prisma.activity.findMany.mock.calls[0][0] as { orderBy: unknown[] }
      expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }])
    })
  })

  describe('deleteEvent', () => {
    it('помечает событие удалённым, а не стирает его', async () => {
      prisma.activity.findUnique.mockResolvedValueOnce({
        id: 'act-1',
        userId: 'user-1',
        deletedAt: null,
      })

      await service.deleteEvent('user-1', 'act-1')

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { deletedAt: expect.any(Date) },
      })
    })

    it('не даёт удалить чужое событие', async () => {
      prisma.activity.findUnique.mockResolvedValueOnce({
        id: 'act-1',
        userId: 'someone-else',
        deletedAt: null,
      })

      await expect(service.deleteEvent('user-1', 'act-1')).rejects.toThrow(NotFoundException)
      expect(prisma.activity.update).not.toHaveBeenCalled()
    })

    it('не даёт удалить уже удалённое', async () => {
      prisma.activity.findUnique.mockResolvedValueOnce({
        id: 'act-1',
        userId: 'user-1',
        deletedAt: new Date(),
      })

      await expect(service.deleteEvent('user-1', 'act-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('restoreEvent', () => {
    it('снимает отметку об удалении', async () => {
      prisma.activity.findUnique.mockResolvedValueOnce({
        id: 'act-1',
        userId: 'user-1',
        deletedAt: new Date(),
      })

      await service.restoreEvent('user-1', 'act-1')

      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { deletedAt: null },
      })
    })

    it('не даёт восстановить то, что не удаляли', async () => {
      prisma.activity.findUnique.mockResolvedValueOnce({
        id: 'act-1',
        userId: 'user-1',
        deletedAt: null,
      })

      await expect(service.restoreEvent('user-1', 'act-1')).rejects.toThrow(NotFoundException)
      expect(prisma.activity.update).not.toHaveBeenCalled()
    })

    it('не даёт восстановить чужое событие', async () => {
      prisma.activity.findUnique.mockResolvedValueOnce({
        id: 'act-1',
        userId: 'someone-else',
        deletedAt: new Date(),
      })

      await expect(service.restoreEvent('user-1', 'act-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findByUsername', () => {
    it('сообщает, что пользователь не найден', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)

      await expect(service.findByUsername('user-1', 'ghost')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findByEntry', () => {
    it('отдаёт события владельцу без проверки видимости профиля', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        userId: 'user-1',
        isHidden: true,
        deletedAt: null,
      })

      await service.findByEntry('user-1', 'entry-1')

      expect(usersService.canViewUserEntries).not.toHaveBeenCalled()
      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { bookEntryId: 'entry-1', deletedAt: null } }),
      )
    })

    it('отдаёт события чужой открытой записи', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce(foreignEntry)

      await service.findByEntry('user-1', 'entry-1')

      expect(usersService.canViewUserEntries).toHaveBeenCalledWith('user-1', 'user-2')
      expect(prisma.activity.findMany).toHaveBeenCalled()
    })

    it('скрывает события, если профиль владельца закрыт', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce(foreignEntry)
      usersService.canViewUserEntries.mockResolvedValueOnce(false)

      await expect(service.findByEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
      expect(prisma.activity.findMany).not.toHaveBeenCalled()
    })

    it('скрывает события скрытой записи от чужого', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({ ...foreignEntry, isHidden: true })

      await expect(service.findByEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
      expect(prisma.activity.findMany).not.toHaveBeenCalled()
    })

    it('считает удалённую запись несуществующей даже для владельца', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        userId: 'user-1',
        isHidden: false,
        deletedAt: new Date(),
      })

      await expect(service.findByEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
    })

    it('не отдаёт удалённые события', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce(foreignEntry)

      await service.findByEntry('user-1', 'entry-1')

      const where = prisma.activity.findMany.mock.calls[0][0].where as { deletedAt: null }
      expect(where.deletedAt).toBeNull()
    })
  })
})
