import axios from 'axios'

const api = axios.create({
  // Empty baseURL: browser → Vite dev server → proxy `/api` → Django (see vite.config.js).
  // Or set VITE_API_BASE_URL to your API origin (e.g. http://127.0.0.1:8000).
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
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
