import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

/**
 * Сервис для работы с базой данных через Prisma.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  // Без явного отключения при hot-reload старые соединения к Postgres не закрываются
  async onModuleDestroy() {
    await this.$disconnect()
  }
}
