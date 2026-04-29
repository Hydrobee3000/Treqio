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
RUN npm run build --workspace=@treqio/api


# ── Стадия 2: runner ─────────────────────────────────────────────────────────
# Финальный минимальный образ — только скомпилированный JS и prod-зависимости.
# Исходный TypeScript и devDependencies сюда не попадают.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
RUN npm install --omit=dev

EXPOSE 4000
CMD ["node", "dist/main"]
