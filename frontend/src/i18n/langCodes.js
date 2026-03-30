/** BCP-style codes supported by the app UI (order = LanguageSelector / TranslateBar) */
export const APP_LANG_CODES = [
  'en',
  'zu',
  'xh',
  'afr',
  'sot',
  'swh',
  'twi',
  'ga',
  'ewe',
  'fante',
  'dagbani',
  'gurene',
  'yoruba',
  'kikuyu',
  'luo',
  'kimeru',
]

/** Localized display name for a language code (falls back to code) */
export function langLabel(t, code) {
  const key = `lang_name_${code}`
  if (t && typeof t[key] === 'string' && t[key].length > 0) return t[key]
  return code
}
