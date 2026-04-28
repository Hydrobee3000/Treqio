// Точка входа React-приложения.
// Именно этот файл указан в index.html как <script type="module">.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const rootElement = document.getElementById('root')

// Явная проверка вместо non-null assertion (rootElement!),
// чтобы получить понятную ошибку если div#root пропал из index.html.
if (!rootElement) throw new Error('Root element not found')

// StrictMode: в dev-режиме намеренно рендерит компоненты дважды,
// чтобы выявить побочные эффекты. В продакшне не влияет на поведение.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
