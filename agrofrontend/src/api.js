import axios from 'axios'

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

/** Human-readable message for UI (DRF `detail`, network, etc.). */
export function getApiErrorMessage(error, fallback) {
  if (!error) return fallback
  if (typeof error.message === 'string' && error.message.startsWith('VITE_API_BASE_URL')) {
    return error.message
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    if (import.meta.env.PROD) {
      return (
        'Cannot reach the API. Set VITE_API_BASE_URL to your deployed API origin when building the app, ' +
        'and ensure the backend allows this site in CORS (CORS_ALLOWED_ORIGINS). Redeploy after changing env.'
      )
    }
    return (
      'Cannot reach the API. Local dev: (1) In Backend: pipenv install && pipenv run python manage.py runserver 127.0.0.1:8000 ' +
      '(2) In agrofrontend: npm run dev. Leave VITE_API_BASE_URL empty in agrofrontend/.env so /api proxies to Django.'
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
  // Dev: leave empty → Vite proxies /api → Django (vite.config.js). Prod: set VITE_API_BASE_URL to the API origin.
  baseURL: apiBase,
})

api.interceptors.request.use((config) => {
  if (import.meta.env.PROD && !apiBase) {
    return Promise.reject(
      new Error(
        'VITE_API_BASE_URL is not set. Configure it for production builds (https API origin, no trailing slash) and rebuild.'
      )
    )
  }
  return config
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
