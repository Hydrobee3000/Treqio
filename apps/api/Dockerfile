# ── Стадия 1: builder ────────────────────────────────────────────────────────
# Устанавливаем зависимости и компилируем TypeScript → JavaScript.
# Разделяем COPY package.json и COPY src/ чтобы Docker кэшировал слой
# с зависимостями — при изменении кода npm install не перезапускается.
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
RUN npm install

COPY tsconfig.json ./
COPY apps/api/ ./apps/api/
# Клиент Prisma генерируется в src/generated/prisma (в гит не коммитится) —
# без этого шага tsc не найдёт импортируемые типы и сборка упадёт.
RUN npm run db:generate --workspace=@treqio/api
RUN npm run build --workspace=@treqio/api


# ── Стадия 2: runner ─────────────────────────────────────────────────────────
# Финальный минимальный образ — только скомпилированный JS и prod-зависимости.
# Исходный TypeScript сюда не попадает, но CLI prisma нужен для миграций.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/apps/api/prisma ./prisma
RUN npm install --omit=dev

EXPOSE 4000
# Перед стартом сервера накатываем все накопленные миграции на базу.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
