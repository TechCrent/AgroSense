import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

export const scanPlant = (imageFile) => {
  const form = new FormData()
  form.append('image', imageFile)
  return api.post('/api/scan/', form)
}

export const confirmPlant = (imageFile, plantName, language) => {
  const form = new FormData()
  form.append('image', imageFile)
  form.append('plant_name', plantName)
  form.append('language', language)
  return api.post('/api/confirm/', form)
}
