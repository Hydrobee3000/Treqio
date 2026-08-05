import { Test } from '@nestjs/testing'
import { BooksService } from './books.service'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'

describe('BooksService', () => {
  let service: BooksService
  let prisma: {
    bookEntry: { findMany: jest.Mock }
  }
  let usersService: { getUserForEntries: jest.Mock }

  beforeEach(async () => {
    prisma = {
      bookEntry: { findMany: jest.fn().mockResolvedValue([]) },
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
        expect.objectContaining({ where: { userId: 'user-2', isHidden: false } }),
      )
    })

    it('keeps hidden entries visible to their owner', async () => {
      usersService.getUserForEntries.mockResolvedValueOnce({ id: 'user-1' })

      await service.findEntriesByUsername('user-1', 'own_handle')

      expect(prisma.bookEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      )
    })
  })

  describe('findUserEntries', () => {
    it('returns hidden entries of the current user', async () => {
      await service.findUserEntries('user-1')

      expect(prisma.bookEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      )
    })
  })
})
