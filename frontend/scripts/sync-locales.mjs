/**
 * Merges en.json into every other locale file: { ...en, ...existing }
 * so missing keys inherit English until translated, and existing translations stay.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.join(__dirname, '../src/locales')

const enPath = path.join(localesDir, 'en.json')
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))

for (const file of fs.readdirSync(localesDir)) {
  if (!file.endsWith('.json') || file === 'en.json') continue
  const p = path.join(localesDir, file)
  let existing = {}
  try {
    existing = JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    console.warn('Skip invalid JSON:', file)
    continue
  }
  const merged = { ...en, ...existing }
  fs.writeFileSync(p, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
  console.log('Merged:', file)
}
