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
  }
  let usersService: { canViewUserEntries: jest.Mock }

  /** Чужая запись, открытая для просмотра. */
  const foreignEntry = { userId: 'user-2', isHidden: false, deletedAt: null }

  beforeEach(async () => {
    prisma = {
      bookEntry: { findUnique: jest.fn() },
      activity: { findMany: jest.fn().mockResolvedValue([]) },
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
