import axios from 'axios'

function apiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || typeof raw !== 'string') return ''
  return raw.trim().replace(/\/+$/, '')
}

/** Human-readable message for UI (DRF `detail`, network, etc.). */
export function getApiErrorMessage(error, fallback) {
  if (!error) return fallback
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    if (import.meta.env.PROD) {
      const hasBase = Boolean(apiBaseUrl())
      return hasBase
        ? 'Cannot reach the API (CORS, wrong URL, or backend down). Check Render logs; free tier cold starts can take 30–60s. Ensure CORS_ALLOWED_ORIGINS on Render matches this site’s exact https origin (including preview URLs).'
        : 'Cannot reach the API. For direct calls to Render, set VITE_API_BASE_URL in Vercel (Production + Preview if you use previews), redeploy, and confirm the built JS contains your backend URL. Or rely on /api rewrites in the repo root vercel.json.'
    }
    return 'Cannot reach the server. Start Django in Backend: pipenv run python manage.py runserver (port 8000).'
  }
  const status = error.response?.status
  const d = error.response?.data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d.length) {
    const first = d[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object' && first.msg) return String(first.msg)
  }
  if (status === 502 || status === 503) {
    return typeof d === 'string' ? d : fallback
  }
  return fallback
}

const api = axios.create({
  // Empty baseURL: browser → Vite dev server → proxy `/api` → Django (see vite.config.js).
  // Production on Vercel: same-origin /api → rewrites in repo root vercel.json (monorepo) or agrofrontend/vercel.json.
  // Or set VITE_API_BASE_URL to your API origin (build-time); trimmed, trailing slashes stripped.
  baseURL: apiBaseUrl(),
})

export const scanPlant = (imageFile) => {
  const form = new FormData()
  form.append('image', imageFile)
  return api.post('/api/scan/', form)
}

/**
 * @param {object} [meta] - optional fields for Django / integration
 * @param {string} [meta.scientificName] - maps to scientific_name
 * @param {number} [meta.confidence] - maps to plant_confidence (from scan)
 */
export const confirmPlant = (imageFile, plantName, language, meta = {}) => {
  const form = new FormData()
  form.append('image', imageFile)
  form.append('plant_name', plantName)
  form.append('language', language)
  if (meta.scientificName != null && meta.scientificName !== '') {
    form.append('scientific_name', String(meta.scientificName))
  }
  if (meta.confidence != null && !Number.isNaN(Number(meta.confidence))) {
    form.append('plant_confidence', String(meta.confidence))
  }
  return api.post('/api/confirm/', form)
}
