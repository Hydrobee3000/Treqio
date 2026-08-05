import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ActivityService } from '../activity/activity.service'
import { BooksService, TRASH_RETENTION_DAYS } from './books.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'

describe('BooksService', () => {
  let service: BooksService
  let prisma: {
    bookEntry: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; create: jest.Mock }
    $transaction: jest.Mock
  }
  let usersService: { getUserForEntries: jest.Mock }
  let activityService: {
    recordEntryAdded: jest.Mock
    recordStatusChanged: jest.Mock
    recordRated: jest.Mock
  }

  beforeEach(async () => {
    prisma = {
      bookEntry: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
      },
      // Транзакция выполняет колбэк с тем же мок-клиентом — так проверки
      // на вызовы внутри неё работают как обычно.
      $transaction: jest.fn(),
    }
    prisma.$transaction.mockImplementation((fn: (tx: unknown) => unknown) => fn(prisma))

    usersService = { getUserForEntries: jest.fn() }
    activityService = {
      recordEntryAdded: jest.fn(),
      recordStatusChanged: jest.fn(),
      recordRated: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
        { provide: ActivityService, useValue: activityService },
      ],
    }).compile()

    service = module.get(BooksService)
  })

  describe('findEntriesByUsername', () => {
    it('hides entries marked as hidden from another user', async () => {
      usersService.getUserForEntries.mockResolvedValueOnce({ id: 'user-2' })

      await service.findEntriesByUsername('user-1', 'jane')

      expect(prisma.bookEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-2', deletedAt: null, isHidden: false } }),
      )
    })

    it('keeps hidden entries visible to their owner', async () => {
      usersService.getUserForEntries.mockResolvedValueOnce({ id: 'user-1' })

      await service.findEntriesByUsername('user-1', 'own_handle')

      expect(prisma.bookEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', deletedAt: null } }),
      )
    })
  })

  describe('findUserEntries', () => {
    it('returns hidden entries of the current user but never deleted ones', async () => {
      await service.findUserEntries('user-1')

      expect(prisma.bookEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', deletedAt: null } }),
      )
    })
  })

  describe('findDeletedEntries', () => {
    it('returns only entries deleted within the retention window', async () => {
      await service.findDeletedEntries('user-1')

      const where = prisma.bookEntry.findMany.mock.calls[0][0].where as {
        userId: string
        deletedAt: { gte: Date }
      }
      expect(where.userId).toBe('user-1')

      // Граница отсечения — ровно срок хранения назад от текущего момента.
      const expectedCutoff = Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000
      expect(where.deletedAt.gte.getTime()).toBeCloseTo(expectedCutoff, -3)
    })
  })

  describe('deleteEntry', () => {
    it('marks the entry as deleted instead of removing it', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'user-1',
        deletedAt: null,
      })

      await service.deleteEntry('user-1', 'entry-1')

      expect(prisma.bookEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-1' },
          data: { deletedAt: expect.any(Date) },
        }),
      )
    })

    it('refuses to delete an entry of another user', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'someone-else',
        deletedAt: null,
      })

      await expect(service.deleteEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
      expect(prisma.bookEntry.update).not.toHaveBeenCalled()
    })

    it('treats an already deleted entry as missing', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'user-1',
        deletedAt: new Date(),
      })

      await expect(service.deleteEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('restoreEntry', () => {
    it('clears the deletion mark', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'user-1',
        deletedAt: new Date(),
      })

      await service.restoreEntry('user-1', 'entry-1')

      expect(prisma.bookEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'entry-1' },
          data: { deletedAt: null },
        }),
      )
    })

    it('refuses to restore an entry that was never deleted', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'user-1',
        deletedAt: null,
      })

      await expect(service.restoreEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
      expect(prisma.bookEntry.update).not.toHaveBeenCalled()
    })

    it('refuses to restore an entry of another user', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'someone-else',
        deletedAt: new Date(),
      })

      await expect(service.restoreEntry('user-1', 'entry-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateEntry', () => {
    it('treats a deleted entry as missing', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({
        id: 'entry-1',
        userId: 'user-1',
        deletedAt: new Date(),
      })

      await expect(service.updateEntry('user-1', 'entry-1', { rating: 9 })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('журнал активности', () => {
    /** Активная запись пользователя в исходном состоянии. */
    const activeEntry = {
      id: 'entry-1',
      userId: 'user-1',
      status: 'WANT',
      rating: null,
      startDate: null,
      finishDate: null,
      deletedAt: null,
    }

    it('записывает событие о добавлении книги', async () => {
      const created = { ...activeEntry, createdAt: new Date() }
      prisma.bookEntry.create.mockResolvedValueOnce(created)

      await service.createEntry('user-1', { bookId: 'book-1', status: 'READING' })

      expect(activityService.recordEntryAdded).toHaveBeenCalledWith(prisma, created)
    })

    it('записывает смену статуса', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce(activeEntry)

      await service.updateEntry('user-1', 'entry-1', { status: 'READING' })

      expect(activityService.recordStatusChanged).toHaveBeenCalledWith(
        prisma,
        activeEntry,
        'WANT',
        'READING',
        expect.any(Date),
      )
    })

    it('записывает оценку вместе с предыдущим значением', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({ ...activeEntry, rating: 7 })

      await service.updateEntry('user-1', 'entry-1', { rating: 9 })

      expect(activityService.recordRated).toHaveBeenCalledWith(
        prisma,
        expect.objectContaining({ rating: 7 }),
        9,
        7,
        expect.any(Date),
      )
    })

    it('не записывает событие, если значение не изменилось', async () => {
      prisma.bookEntry.findUnique.mockResolvedValueOnce({ ...activeEntry, rating: 9 })

      await service.updateEntry('user-1', 'entry-1', { rating: 9, status: 'WANT' })

      expect(activityService.recordRated).not.toHaveBeenCalled()
      expect(activityService.recordStatusChanged).not.toHaveBeenCalled()
    })

    it('пишет запись и событие в одной транзакции', async () => {
      prisma.bookEntry.create.mockResolvedValueOnce({ ...activeEntry, createdAt: new Date() })

      await service.createEntry('user-1', { bookId: 'book-1', status: 'WANT' })

      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })
})
