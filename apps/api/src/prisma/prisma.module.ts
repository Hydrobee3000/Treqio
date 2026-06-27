import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

/**
 * @Global — делает PrismaService доступным во всех модулях без явного импорта.
 * Достаточно один раз импортировать PrismaModule в AppModule.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
