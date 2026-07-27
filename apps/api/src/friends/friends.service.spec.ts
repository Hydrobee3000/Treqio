import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { FriendsService } from './friends.service'
import { PrismaService } from '../prisma/prisma.service'

describe('FriendsService', () => {
  let service: FriendsService
  let prisma: {
    user: { findUnique: jest.Mock }
    friendship: {
      findFirst: jest.Mock
      findUnique: jest.Mock
      findMany: jest.Mock
      create: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      friendship: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module = await Test.createTestingModule({
      providers: [FriendsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(FriendsService)
  })

  describe('sendRequest', () => {
    it('throws when the target username does not exist', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)

      await expect(service.sendRequest('user-1', 'unknown')).rejects.toThrow(NotFoundException)
    })

    it('throws when trying to add yourself', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', username: 'self' })

      await expect(service.sendRequest('user-1', 'self')).rejects.toThrow(ConflictException)
    })

    it('creates a pending request when no relation exists yet', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-2', username: 'jane' })
      prisma.friendship.findFirst.mockResolvedValueOnce(null)
      const created = { id: 'f-1', senderId: 'user-1', receiverId: 'user-2', status: 'PENDING' }
      prisma.friendship.create.mockResolvedValueOnce(created)

      const result = await service.sendRequest('user-1', 'jane')

      expect(result).toBe(created)
      expect(prisma.friendship.create).toHaveBeenCalledWith({
        data: { senderId: 'user-1', receiverId: 'user-2', status: 'PENDING' },
      })
    })

    it('throws when already friends', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-2', username: 'jane' })
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        status: 'ACCEPTED',
      })

      await expect(service.sendRequest('user-1', 'jane')).rejects.toThrow(ConflictException)
      expect(prisma.friendship.create).not.toHaveBeenCalled()
    })

    it('throws when a request was already sent by the same sender', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-2', username: 'jane' })
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        status: 'PENDING',
      })

      await expect(service.sendRequest('user-1', 'jane')).rejects.toThrow(ConflictException)
    })

    it('accepts the existing reverse request instead of creating a new one', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-2', username: 'jane' })
      prisma.friendship.findFirst.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        status: 'PENDING',
      })
      const accepted = { id: 'f-1', senderId: 'user-2', receiverId: 'user-1', status: 'ACCEPTED' }
      prisma.friendship.update.mockResolvedValueOnce(accepted)

      const result = await service.sendRequest('user-1', 'jane')

      expect(result).toBe(accepted)
      expect(prisma.friendship.create).not.toHaveBeenCalled()
      expect(prisma.friendship.update).toHaveBeenCalledWith({
        where: { id: 'f-1' },
        data: { status: 'ACCEPTED' },
      })
    })
  })

  describe('getFriends', () => {
    it('returns the other side of each friendship together with its id', async () => {
      const jane = { id: 'user-2', username: 'jane' }
      const bob = { id: 'user-3', username: 'bob' }
      prisma.friendship.findMany.mockResolvedValueOnce([
        { id: 'f-1', senderId: 'user-1', receiverId: 'user-2', sender: {}, receiver: jane },
        { id: 'f-2', senderId: 'user-3', receiverId: 'user-1', sender: bob, receiver: {} },
      ])

      const result = await service.getFriends('user-1')

      expect(result).toEqual([
        { friendshipId: 'f-1', user: jane },
        { friendshipId: 'f-2', user: bob },
      ])
    })
  })

  describe('acceptRequest', () => {
    it('throws when the request does not exist or does not belong to the user', async () => {
      prisma.friendship.findUnique.mockResolvedValueOnce(null)

      await expect(service.acceptRequest('user-1', 'f-1')).rejects.toThrow(NotFoundException)
    })

    it('throws when the current user is not the receiver', async () => {
      prisma.friendship.findUnique.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        status: 'PENDING',
      })

      await expect(service.acceptRequest('user-1', 'f-1')).rejects.toThrow(NotFoundException)
    })

    it('accepts a pending request addressed to the user', async () => {
      prisma.friendship.findUnique.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        status: 'PENDING',
      })
      const accepted = { id: 'f-1', status: 'ACCEPTED' }
      prisma.friendship.update.mockResolvedValueOnce(accepted)

      const result = await service.acceptRequest('user-1', 'f-1')

      expect(result).toBe(accepted)
    })
  })

  describe('removeFriendship', () => {
    it('throws when the record does not belong to the user', async () => {
      prisma.friendship.findUnique.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-2',
        receiverId: 'user-3',
        status: 'ACCEPTED',
      })

      await expect(service.removeFriendship('user-1', 'f-1')).rejects.toThrow(NotFoundException)
      expect(prisma.friendship.delete).not.toHaveBeenCalled()
    })

    it('deletes the record when the user is the sender or receiver', async () => {
      prisma.friendship.findUnique.mockResolvedValueOnce({
        id: 'f-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        status: 'ACCEPTED',
      })

      await service.removeFriendship('user-1', 'f-1')

      expect(prisma.friendship.delete).toHaveBeenCalledWith({ where: { id: 'f-1' } })
    })
  })
})
