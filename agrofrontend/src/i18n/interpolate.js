/** Replace {{key}} placeholders in locale strings */
export function interpolate(str, vars = {}) {
  if (typeof str !== 'string') return ''
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key]
    return v !== undefined && v !== null ? String(v) : ''
  })
}
