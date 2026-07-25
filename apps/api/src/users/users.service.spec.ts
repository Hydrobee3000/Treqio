import { ConflictException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '../generated/prisma/client'

describe('UsersService', () => {
  let service: UsersService
  let prisma: {
    user: {
      findUnique: jest.Mock
      update: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    }

    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(UsersService)
  })

  describe('updateProfile', () => {
    it('updates the profile when the username is free', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)
      const updated = { id: 'user-1', username: 'new_handle' }
      prisma.user.update.mockResolvedValueOnce(updated)

      const result = await service.updateProfile('user-1', { username: 'new_handle' })

      expect(result).toBe(updated)
    })

    it('allows keeping the username unchanged (taken by the same user)', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', username: 'same_handle' })
      const updated = { id: 'user-1', username: 'same_handle' }
      prisma.user.update.mockResolvedValueOnce(updated)

      const result = await service.updateProfile('user-1', { username: 'same_handle' })

      expect(result).toBe(updated)
    })

    it('throws a conflict when the username is taken by another user', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'someone-else' })

      await expect(service.updateProfile('user-1', { username: 'taken_handle' })).rejects.toThrow(
        ConflictException,
      )
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    it('converts a unique-constraint race condition on update into a conflict', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)
      prisma.user.update.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.8.0',
        }),
      )

      await expect(service.updateProfile('user-1', { username: 'raced_handle' })).rejects.toThrow(
        ConflictException,
      )
    })

    it('rethrows unrelated errors from update as-is', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)
      prisma.user.update.mockRejectedValueOnce(new Error('database is down'))

      await expect(service.updateProfile('user-1', { username: 'irrelevant' })).rejects.toThrow(
        'database is down',
      )
    })
  })
})
