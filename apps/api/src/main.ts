// dotenv должен быть импортирован первым — загружает .env в process.env до инициализации NestJS.
import 'dotenv/config'
// reflect-metadata должен быть импортирован до любых NestJS импортов.
// Он добавляет поддержку метаданных декораторов в runtime.
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import pkg from '../package.json'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Парсинг cookie — нужен для чтения refresh_token в /auth/refresh
  app.use(cookieParser())

  // Глобальная валидация DTO — возвращает 400 при нарушении ограничений.
  // whitelist: true — отбрасывает поля, которых нет в DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  // Префикс /api для всех маршрутов: /api/health, /api/books и т.д.
  app.setGlobalPrefix('api')

  // Swagger UI включается явно через переменную окружения
  if (process.env['SWAGGER_ENABLED'] === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Treqio API')
      .setDescription('REST API приложения Treqio')
      .setVersion(pkg.version)
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  const port = process.env['PORT'] ?? 4000
  await app.listen(port)
  console.warn(`API запущен на порту ${port}`)
}

bootstrap()
