// reflect-metadata должен быть импортирован первым — до любых NestJS импортов.
// Он добавляет поддержку метаданных декораторов в runtime.
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Префикс /api для всех маршрутов: /api/health, /api/books и т.д.
  app.setGlobalPrefix('api')

  const port = process.env['PORT'] ?? 4000
  await app.listen(port)
  console.warn(`API запущен на порту ${port}`)
}

bootstrap()
