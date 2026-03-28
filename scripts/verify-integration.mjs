#!/usr/bin/env node
/**
 * Smoke-check that the Django API is up and wired (health + OpenAPI schema).
 * Run with the backend already listening (local or deployed).
 *
 *   npm run verify
 *   VERIFY_API_URL=https://your-api.onrender.com npm run verify
 */
const base = (process.env.VERIFY_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

async function assertOk(res, label) {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${label} → HTTP ${res.status} ${body.slice(0, 200)}`)
  }
}

async function main() {
  const h = await fetch(`${base}/health/`)
  await assertOk(h, 'GET /health/')
  const healthText = (await h.text()).trim()
  if (healthText !== 'ok') {
    throw new Error(`GET /health/ expected body "ok", got: ${healthText.slice(0, 100)}`)
  }

  const schema = await fetch(`${base}/api/schema/`)
  await assertOk(schema, 'GET /api/schema/')
  const ct = schema.headers.get('content-type') || ''
  if (!ct.includes('json') && !ct.includes('yaml')) {
    console.warn('Warning: /api/schema/ content-type unexpected:', ct)
  }

  console.log(`Integration OK — ${base}`)
}

main().catch((err) => {
  console.error(err.message || err)
  console.error(
    '\nStart the backend first, e.g. from Backend/: python -m pip install -r requirements.txt && python manage.py migrate && python manage.py runserver 127.0.0.1:8000\n'
  )
  process.exit(1)
})
