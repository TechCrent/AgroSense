import axios from 'axios'

/** Origin only, no path; empty means same-origin `/api` (Vite dev proxy or Vercel rewrite). */
function normalizedApiBase() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || typeof raw !== 'string') return ''
  return raw.trim().replace(/\/+$/, '')
}

const apiBase = normalizedApiBase()

/**
 * Human-readable message for UI (DRF `detail`, network, etc.).
 * Pass the full locale object `t` from useLocale() so network hints match UI language.
 */
export function getApiErrorMessage(error, t) {
  const fallback =
    typeof t === 'string'
      ? t
      : (t && t.error_scan_failed) || 'Scan failed. Please try again.'
  if (!error) return fallback
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    if (typeof t === 'object' && t !== null) {
      if (import.meta.env.PROD) {
        const crossOrigin = Boolean(apiBase)
        return crossOrigin ? t.error_network_prod_cross_origin : t.error_network_prod_same_origin
      }
      return t.error_network_dev
    }
    if (import.meta.env.PROD) {
      const crossOrigin = Boolean(apiBase)
      return crossOrigin
        ? 'Cannot reach the API (wrong URL, CORS, or backend waking/sleeping on Render). Confirm VITE_API_BASE_URL has no typo; on Render set CORS_ALLOWED_ORIGINS to this site\'s exact https origin (and preview URLs if you use them). Retry after 30-60s on cold start.'
        : 'Cannot reach the API. Same-origin /api should proxy via repo-root vercel.json. Update the rewrite destination to your Render URL, redeploy Vercel, or set VITE_API_BASE_URL to that URL and redeploy.'
    }
    return (
      'Cannot reach the API. Local dev: (1) In backend: pip install -r requirements.txt && python manage.py runserver 127.0.0.1:8000 ' +
      '(2) In frontend: npm run dev. Leave VITE_API_BASE_URL empty in frontend/.env so /api proxies to Django.'
    )
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
  // Empty baseURL: dev → Vite proxy /api → Django; prod → same-origin /api → Vercel rewrite to Render (see vercel.json).
  // Or set VITE_API_BASE_URL at build time to call Render directly (then CORS on Django must allow this origin).
  baseURL: apiBase,
})

export const scanPlant = (imageFile) => {
  const form = new FormData()
  form.append('images', imageFile)
  return api.post('/api/scan/', form)
}

/**
 * @param {object} [meta] - optional fields for the backend API
 * @param {string} [meta.scientificName] - maps to scientific_name
 * @param {number} [meta.confidence] - maps to plant_confidence (from scan)
 */
export const confirmPlant = (imageFile, plantName, language, meta = {}) => {
  const form = new FormData()
  form.append('images', imageFile)
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
