import type { Prisma } from '../generated/prisma/client'

/**
 * Поля пользователя, доступные другим пользователям.
 */
export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  entriesVisibility: true,
  createdAt: true,
} satisfies Prisma.UserSelect

/**
 * Публичные данные пользователя — без email и данных OAuth-провайдера.
 */
export type PublicUser = Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }>
