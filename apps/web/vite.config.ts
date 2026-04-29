// Конфиг сборщика Vite для apps/web.
// Запускается в Node.js — не в браузере.
import { defineConfig } from 'vite'
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

  server: {
    port: 3000,
    // Автоматически открывает браузер при запуске dev-сервера.
    open: true,
  },
})
