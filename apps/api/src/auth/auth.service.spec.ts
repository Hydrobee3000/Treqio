import { InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'

const googleProfile = {
  googleId: 'google-1',
  email: 'jane@example.com',
  displayName: 'Jane Doe',
  avatarUrl: 'https://example.com/avatar.png',
}

describe('AuthService', () => {
  let service: AuthService
  let prisma: {
    user: {
      findUnique: jest.Mock
      create: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  describe('findOrCreateGoogleUser', () => {
    it('returns the existing user without creating a new one', async () => {
      const existing = { id: 'user-1' }
      prisma.user.findUnique.mockResolvedValueOnce(existing)

      const result = await service.findOrCreateGoogleUser(googleProfile)

      expect(result).toBe(existing)
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('creates a new user with a generated username and the Google display name', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // provider_providerId lookup — no existing user
        .mockResolvedValueOnce(null) // username uniqueness check — first candidate is free
      const created = { id: 'user-2' }
      prisma.user.create.mockResolvedValueOnce(created)

      const result = await service.findOrCreateGoogleUser(googleProfile)

      expect(result).toBe(created)
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: googleProfile.email,
          displayName: googleProfile.displayName,
          avatarUrl: googleProfile.avatarUrl,
          provider: 'google',
          providerId: googleProfile.googleId,
          username: expect.stringMatching(/^user\d+$/),
        }),
      })
    })

    it('retries generation when the first candidate username is taken', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // provider_providerId lookup
        .mockResolvedValueOnce({ id: 'someone-else' }) // first candidate taken
        .mockResolvedValueOnce(null) // second candidate free
      prisma.user.create.mockResolvedValueOnce({ id: 'user-3' })

      await service.findOrCreateGoogleUser(googleProfile)

      // 1 provider lookup + 2 username checks
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(3)
    })

    it('throws after exhausting all generation attempts', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // provider_providerId lookup — no existing user
        .mockResolvedValue({ id: 'taken' }) // every username candidate is already taken

      await expect(service.findOrCreateGoogleUser(googleProfile)).rejects.toThrow(
        InternalServerErrorException,
      )
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })
})
