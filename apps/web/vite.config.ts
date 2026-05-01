// Конфиг сборщика Vite для apps/web.
// Запускается в Node.js — не в браузере.
// Также содержит конфигурацию Vitest (секция test) — он читает этот файл напрямую.
// defineConfig из vitest/config расширяет тип Vite-конфига полем test.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    // Добавляет поддержку JSX и Fast Refresh (горячая перезагрузка
    // компонентов без потери состояния при изменении кода).
    react(),
  ],

  resolve: {
    alias: {
      // Алиас @ → абсолютный путь до папки src.
      // Должен совпадать с paths в tsconfig.app.json.
      // __dirname здесь — путь до папки где лежит этот файл (apps/web).
      '@': resolve(__dirname, 'src'),
    },
  },

  css: {
    modules: {
      // Формат генерируемых имён классов: [имя файла]_[класс]__[хэш].
      // Например: Button_root__x7k2p — уникально, не конфликтует с другими компонентами.
      localsConvention: 'camelCase',
    },
  },

  test: {
    // Эмулирует браузерное окружение (window, document) в Node.js при запуске тестов.
    // Нужно для тестирования React-компонентов без реального браузера.
    environment: 'jsdom',
    // Глобальные функции describe/it/expect доступны без импорта в каждом файле.
    globals: true,
    // Файл с глобальной настройкой тестов (моки, кастомные матчеры).
    setupFiles: ['./src/shared/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Считаем покрытие только для нашего кода, не для node_modules.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/shared/test/**'],
    },
  },

  server: {
    port: 3000,
    open: true,
    proxy: {
      // Все запросы на /api/* перенаправляются на NestJS.
      // В продакшне эту роль выполняет nginx.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
