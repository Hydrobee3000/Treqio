import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ActivityService } from './activity.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'

describe('ActivityService', () => {
  let service: ActivityService
  let prisma: {
    bookEntry: { findUnique: jest.Mock }
    activity: { findMany: jest.Mock }
    user: { findUnique: jest.Mock }
  }
  let usersService: { canViewUserEntries: jest.Mock }

  /** Чужая запись, открытая для просмотра. */
  const foreignEntry = { userId: 'user-2', isHidden: false, deletedAt: null }

  beforeEach(async () => {
    prisma = {
      bookEntry: { findUnique: jest.fn() },
      activity: { findMany: jest.fn().mockResolvedValue([]) },
      user: { findUnique: jest.fn() },
    }
    usersService = { canViewUserEntries: jest.fn().mockResolvedValue(true) }

    const module = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
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
