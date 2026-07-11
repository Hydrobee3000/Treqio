/* global process, console */
// Проверяет что все ключи из ru.json присутствуют в en.json.
// Запуск: npm run check:i18n --workspace=@treqio/web
// Завершается с кодом 1 если есть пропущенные ключи — используется в CI.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = join(__dirname, '../src/shared/locales')

const ru = JSON.parse(readFileSync(join(localesDir, 'ru.json'), 'utf-8'))
const en = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf-8'))

/** Рекурсивно собирает все листовые ключи в виде «a.b.c». */
function collectKeys(obj, prefix = '') {
  return Object.keys(obj).flatMap((key) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof obj[key] === 'object' && obj[key] !== null ? collectKeys(obj[key], path) : [path]
  })
}

const ruKeys = collectKeys(ru)
const enKeys = new Set(collectKeys(en))

const missing = ruKeys.filter((k) => !enKeys.has(k))

if (missing.length > 0) {
  console.error('\n❌ Missing in en.json:')
  missing.forEach((k) => console.error(`   ${k}`))
  console.error('')
  process.exit(1)
} else {
  console.warn('\n✅ All keys present in en.json\n')
}
