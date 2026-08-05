import { NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { BooksService, TRASH_RETENTION_DAYS } from './books.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'

describe('BooksService', () => {
  let service: BooksService
  let prisma: {
    bookEntry: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock }
  }
  let usersService: { getUserForEntries: jest.Mock }

  beforeEach(async () => {
    prisma = {
      bookEntry: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    }
    usersService = { getUserForEntries: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
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
})
