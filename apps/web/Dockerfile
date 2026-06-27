# ── Стадия 1: builder ────────────────────────────────────────────────────────
# Устанавливаем зависимости и собираем статический бандл.
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm install

COPY tsconfig.json ./
COPY apps/web/ ./apps/web/

# Vite инлайнит VITE_*-переменные в бандл на этапе сборки, а не читает их
# в браузере в runtime — поэтому адрес api нужно передать именно как
# build-time аргумент, а не просто переменную окружения контейнера.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build --workspace=@treqio/web


# ── Стадия 2: runner ─────────────────────────────────────────────────────────
# Статическая раздача собранного SPA через serve. Флаг -s включает fallback
# на index.html для любых не найденных путей — без этого прямой переход
# по ссылке на /library или /profile (роуты react-router) даст 404.
FROM node:24-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/dist ./dist
RUN npm install -g serve

EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
