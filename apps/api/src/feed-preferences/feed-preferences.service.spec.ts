import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { FeedPreferenceKind } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { FeedPreferencesService } from './feed-preferences.service'

describe('FeedPreferencesService', () => {
  let service: FeedPreferencesService
  let prisma: {
    feedPreference: { upsert: jest.Mock; deleteMany: jest.Mock; findMany: jest.Mock }
    user: { findUnique: jest.Mock }
  }

  beforeEach(async () => {
    prisma = {
      feedPreference: {
        upsert: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-2' }) },
    }

    const module = await Test.createTestingModule({
      providers: [FeedPreferencesService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get(FeedPreferencesService)
  })

  describe('setPreference', () => {
    it('сохраняет настройку по паре пользователей и виду', async () => {
      await service.setPreference('user-1', 'user-2', FeedPreferenceKind.MUTED)

      expect(prisma.feedPreference.upsert).toHaveBeenCalledWith({
        where: {
          ownerId_targetId_kind: {
            ownerId: 'user-1',
            targetId: 'user-2',
            kind: FeedPreferenceKind.MUTED,
          },
        },
        create: { ownerId: 'user-1', targetId: 'user-2', kind: FeedPreferenceKind.MUTED },
        update: {},
      })
    })

    it('не даёт настроить ленту на себя', async () => {
      await expect(
        service.setPreference('user-1', 'user-1', FeedPreferenceKind.MUTED),
      ).rejects.toThrow(ConflictException)
      expect(prisma.feedPreference.upsert).not.toHaveBeenCalled()
    })

    it('не даёт настроить ленту на несуществующего пользователя', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)

      await expect(
        service.setPreference('user-1', 'ghost', FeedPreferenceKind.HIDDEN_FROM),
      ).rejects.toThrow(NotFoundException)
      expect(prisma.feedPreference.upsert).not.toHaveBeenCalled()
    })
  })

  describe('removePreference', () => {
    it('снимает настройку выбранного вида', async () => {
      await service.removePreference('user-1', 'user-2', FeedPreferenceKind.HIDDEN_FROM)

      expect(prisma.feedPreference.deleteMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1', targetId: 'user-2', kind: FeedPreferenceKind.HIDDEN_FROM },
      })
    })

    it('не считает ошибкой снятие отсутствующей настройки', async () => {
      await expect(
        service.removePreference('user-1', 'user-2', FeedPreferenceKind.MUTED),
      ).resolves.toBeUndefined()
    })
  })

  describe('getPreferences', () => {
    it('раскладывает настройки по видам', async () => {
      prisma.feedPreference.findMany.mockResolvedValueOnce([
        { kind: FeedPreferenceKind.MUTED, target: { id: 'user-2' } },
        { kind: FeedPreferenceKind.HIDDEN_FROM, target: { id: 'user-3' } },
      ])

      const result = await service.getPreferences('user-1')

      expect(result.muted).toEqual([{ id: 'user-2' }])
      expect(result.hiddenFrom).toEqual([{ id: 'user-3' }])
    })
  })

  describe('getExcludedAuthorIds', () => {
    it('ищет настройки в обе стороны от читателя', async () => {
      await service.getExcludedAuthorIds('user-1')

      const where = prisma.feedPreference.findMany.mock.calls[0][0].where as { OR: unknown[] }
      expect(where.OR).toEqual([
        { ownerId: 'user-1', kind: FeedPreferenceKind.MUTED },
        { targetId: 'user-1', kind: FeedPreferenceKind.HIDDEN_FROM },
      ])
    })

    it('исключает заглушённого по цели, а скрывшегося по владельцу', async () => {
      prisma.feedPreference.findMany.mockResolvedValueOnce([
        { ownerId: 'user-1', targetId: 'muted-user', kind: FeedPreferenceKind.MUTED },
        { ownerId: 'hidden-user', targetId: 'user-1', kind: FeedPreferenceKind.HIDDEN_FROM },
      ])

      const result = await service.getExcludedAuthorIds('user-1')

      expect(result).toEqual(['muted-user', 'hidden-user'])
    })
  })
})
