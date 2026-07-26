import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '../generated/prisma/client'

/** Профиль в том виде, в каком его отдаёт выборка публичных полей. */
const publicUserRow = {
  id: 'user-2',
  username: 'jane',
  displayName: 'Jane',
  avatarUrl: null,
  bio: null,
  isPublic: true,
  createdAt: new Date('2026-01-01'),
}

describe('UsersService', () => {
  let service: UsersService
  let prisma: {
    user: {
      findUnique: jest.Mock
      findMany: jest.Mock
      update: jest.Mock
    }
    friendship: {
      findFirst: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      friendship: {
        findFirst: jest.fn(),
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

  describe('getPublicProfile', () => {
    it('throws when the username does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)

      await expect(service.getPublicProfile('user-1', 'ghost')).rejects.toThrow(NotFoundException)
    })

    it('never exposes private fields of the requested user', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(publicUserRow)
      prisma.friendship.findFirst.mockResolvedValueOnce(null)

      const result = await service.getPublicProfile('user-1', 'jane')

      expect(result).not.toHaveProperty('email')
      expect(result).not.toHaveProperty('provider')
      expect(result).not.toHaveProperty('providerId')
    })

    it('reports no relation when the users are unconnected', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(publicUserRow)
      prisma.friendship.findFirst.mockResolvedValueOnce(null)

      const result = await service.getPublicProfile('user-1', 'jane')

      expect(result.friendshipState).toBe('NONE')
      expect(result.friendshipId).toBeNull()
    })

    it('reports an accepted friendship', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(publicUserRow)
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        status: 'ACCEPTED',
      })

      const result = await service.getPublicProfile('user-1', 'jane')

      expect(result.friendshipState).toBe('FRIENDS')
      expect(result.friendshipId).toBe('f-1')
    })

    it('distinguishes a sent request from a received one', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(publicUserRow)
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        status: 'PENDING',
      })

      const sent = await service.getPublicProfile('user-1', 'jane')
      expect(sent.friendshipState).toBe('REQUEST_SENT')

      prisma.user.findUnique.mockResolvedValueOnce(publicUserRow)
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        status: 'PENDING',
      })

      const received = await service.getPublicProfile('user-1', 'jane')
      expect(received.friendshipState).toBe('REQUEST_RECEIVED')
    })

    it('hides entries of a private profile from a stranger', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ ...publicUserRow, isPublic: false })
      prisma.friendship.findFirst.mockResolvedValueOnce(null)

      const result = await service.getPublicProfile('user-1', 'jane')

      expect(result.canViewEntries).toBe(false)
    })

    it('opens entries of a private profile to a friend', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ ...publicUserRow, isPublic: false })
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        status: 'ACCEPTED',
      })

      const result = await service.getPublicProfile('user-1', 'jane')

      expect(result.canViewEntries).toBe(true)
    })

    it('opens own private profile without querying the friendship table', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        ...publicUserRow,
        id: 'user-1',
        isPublic: false,
      })

      const result = await service.getPublicProfile('user-1', 'jane')

      expect(result.canViewEntries).toBe(true)
      expect(prisma.friendship.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('getUserForEntries', () => {
    it('throws when the viewer has no access to the entries', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ ...publicUserRow, isPublic: false })
      prisma.friendship.findFirst.mockResolvedValueOnce(null)

      await expect(service.getUserForEntries('user-1', 'jane')).rejects.toThrow(ForbiddenException)
    })

    it('returns the profile when the entries are accessible', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(publicUserRow)
      prisma.friendship.findFirst.mockResolvedValueOnce(null)

      const result = await service.getUserForEntries('user-1', 'jane')

      expect(result.id).toBe('user-2')
    })
  })

  describe('searchUsers', () => {
    it('returns nothing for a query shorter than the minimum without hitting the database', async () => {
      const result = await service.searchUsers('user-1', 'a')

      expect(result).toEqual([])
      expect(prisma.user.findMany).not.toHaveBeenCalled()
    })

    it('excludes the searching user from the results', async () => {
      prisma.user.findMany.mockResolvedValueOnce([publicUserRow])

      await service.searchUsers('user-1', 'ja')

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: { not: 'user-1' } }),
        }),
      )
    })

    it('ignores surrounding whitespace in the query', async () => {
      prisma.user.findMany.mockResolvedValueOnce([])

      await service.searchUsers('user-1', '  ja  ')

      const { where } = prisma.user.findMany.mock.calls[0][0]
      expect(where.OR[0].username.startsWith).toBe('ja')
    })
  })
})
