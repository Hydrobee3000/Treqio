# Treqio API

NestJS backend для приложения Treqio. REST API с JWT-авторизацией через OAuth.

Документация endpoints доступна на `http://localhost:4000/api/docs` при `SWAGGER_ENABLED=true`.

---

## Содержание

- [Структура проекта](#структура-проекта)
- [Архитектура](#архитектура)
- [Ключевые пакеты](#ключевые-пакеты)
- [Как добавить новый endpoint](#как-добавить-новый-endpoint)
- [Соглашения](#соглашения)
- [Prisma и база данных](#prisma-и-база-данных)
- [Переменные окружения](#переменные-окружения)
- [Команды](#команды)

---

## Структура проекта

```
apps/api/
├── src/
│   ├── auth/                    # Модуль авторизации
│   │   ├── guards/              # JwtAuthGuard — защита приватных роутов
│   │   ├── strategies/          # GoogleStrategy, JwtStrategy (Passport.js)
│   │   ├── auth.controller.ts   # Маршруты: /auth/google, /auth/me, /auth/refresh, /auth/logout
│   │   ├── auth.module.ts       # Модуль: собирает всё вместе
│   │   └── auth.service.ts      # Логика: генерация токенов, поиск/создание пользователя
│   ├── prisma/
│   │   ├── prisma.module.ts     # Модуль Prisma — экспортирует PrismaService
│   │   └── prisma.service.ts    # Обёртка над PrismaClient
│   ├── app.controller.ts        # Корневой контроллер: GET /api/health
│   ├── app.module.ts            # Корневой модуль — подключает все остальные
│   ├── app.service.ts           # Корневой сервис
│   └── main.ts                  # Точка входа: запуск сервера, Swagger, middleware
├── prisma/
│   ├── schema.prisma            # Схема базы данных
│   └── migrations/              # История SQL-миграций
├── prisma.config.ts             # Конфиг Prisma 7 (путь к .env)
├── jest.config.ts               # Конфиг Jest для тестов
├── Dockerfile                   # Production-образ
└── .env.example                 # Шаблон переменных окружения
```

---

## Архитектура

NestJS строится вокруг трёх понятий: **Module → Controller → Service**.

```
Запрос → Controller → Service → Prisma → База данных
```

- **Module** — контейнер: объявляет что существует, что импортируется, что экспортируется другим модулям.
- **Controller** — принимает HTTP-запросы, вызывает методы сервиса, возвращает ответ. Не содержит бизнес-логику.
- **Service** — вся бизнес-логика: работа с БД, вычисления, вызовы внешних API.

Зависимости между сервисами и модулями разрешает **DI-контейнер** NestJS — он создаёт экземпляры классов и передаёт их в конструкторы автоматически.

---

## Ключевые пакеты

| Пакет                           | Зачем                                                                     |
| ------------------------------- | ------------------------------------------------------------------------- |
| `@nestjs/passport` + `passport` | Интеграция Passport.js стратегий с NestJS DI                              |
| `passport-google-oauth20`       | OAuth 2.0 стратегия для Google                                            |
| `passport-jwt`                  | Извлечение и проверка JWT из заголовка `Authorization`                    |
| `@nestjs/jwt`                   | Генерация и верификация JWT токенов                                       |
| `@prisma/adapter-pg`            | PostgreSQL адаптер для Prisma 7 (новый API вместо `DATABASE_URL` в схеме) |
| `cookie-parser`                 | Парсинг cookie — нужен для чтения `refresh_token` в `/auth/refresh`       |
| `reflect-metadata`              | Поддержка метаданных декораторов в runtime, обязателен для NestJS         |
| `@nestjs/swagger`               | Генерация интерактивной OpenAPI документации                              |

---

## Как добавить новый endpoint

Рассмотрим на примере: добавляем модуль `books` с маршрутом `GET /api/books`.

### 1. Создать файлы модуля

```
src/books/
├── books.controller.ts
├── books.module.ts
└── books.service.ts
```

### 2. Написать сервис

```ts
// books.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.book.findMany()
  }
}
```

### 3. Написать контроллер

```ts
// books.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BooksService } from './books.service'

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({ summary: 'Список всех книг пользователя' })
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.booksService.findAll()
  }
}
```

### 4. Собрать модуль

```ts
// books.module.ts
import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { BooksController } from './books.controller'
import { BooksService } from './books.service'

@Module({
  imports: [PrismaModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
```

### 5. Подключить в AppModule

```ts
// app.module.ts
import { BooksModule } from './books/books.module'

@Module({
  imports: [PrismaModule, AuthModule, BooksModule],
  ...
})
export class AppModule {}
```

---

## Соглашения

### Именование файлов

```
<feature>.module.ts
<feature>.controller.ts
<feature>.service.ts
<feature>.service.spec.ts   # тест для сервиса
```

### Структура модуля

Каждая функциональная область — отдельный модуль в своей папке. Не добавлять логику в `AppModule` напрямую.

### Защита маршрутов

Приватные маршруты помечаются декоратором `@UseGuards(JwtAuthGuard)`. Публичные маршруты — без декоратора.

### Swagger-аннотации

Каждый контроллер должен иметь `@ApiTags('name')`, каждый метод — `@ApiOperation({ summary: '...' })` и `@ApiResponse(...)`.

### Тесты

Файлы тестов называются `*.spec.ts` и лежат рядом с тестируемым файлом. Запуск: `npm run test --workspace=@treqio/api`.

---

## Prisma и база данных

### Изменить схему

1. Отредактировать `prisma/schema.prisma`
2. Создать и применить миграцию:
   ```bash
   npm run db:migrate --workspace=@treqio/api
   ```
3. Регенерировать Prisma Client (происходит автоматически при `db:migrate`):
   ```bash
   npm run db:generate --workspace=@treqio/api
   ```

### Просмотр данных

```bash
npm run db:studio --workspace=@treqio/api
# Открывает браузерный интерфейс на http://localhost:5555
```

---

## Переменные окружения

Все переменные описаны в `.env.example`. Скопируй и заполни:

```bash
cp apps/api/.env.example apps/api/.env
```

Подробное описание каждой переменной — в корневом [README.md](../../README.md#environment-variables).

---

## Команды

Запускать из корня монорепо с флагом `--workspace=@treqio/api`, или из папки `apps/api/` напрямую.

| Команда                 | Описание                                    |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Запуск в режиме разработки с hot-reload     |
| `npm run build`         | Сборка в JavaScript (`dist/`)               |
| `npm run typecheck`     | Проверка типов без компиляции               |
| `npm run lint`          | Проверка линтером                           |
| `npm run test`          | Запуск тестов                               |
| `npm run test:coverage` | Тесты с отчётом покрытия                    |
| `npm run db:migrate`    | Создать и применить миграцию                |
| `npm run db:generate`   | Регенерировать Prisma Client                |
| `npm run db:studio`     | Открыть визуальный браузер БД               |
| `npm run db:reset`      | Сбросить БД и применить все миграции заново |
