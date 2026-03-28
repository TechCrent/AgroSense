import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import en from '../locales/en.json'
import twi from '../locales/twi.json'
import ga from '../locales/ga.json'
import ewe from '../locales/ewe.json'
import fante from '../locales/fante.json'
import dagbani from '../locales/dagbani.json'
import gurene from '../locales/gurene.json'
import yoruba from '../locales/yoruba.json'
import kikuyu from '../locales/kikuyu.json'
import luo from '../locales/luo.json'
import kimeru from '../locales/kimeru.json'
import zu from '../locales/zu.json'
import xh from '../locales/xh.json'
import swh from '../locales/swh.json'
import sot from '../locales/sot.json'
import afr from '../locales/afr.json'

const SETTINGS_KEY = 'agrosense_settings'

const locales = {
  en, twi, ga, ewe, fante, dagbani, gurene, yoruba, kikuyu, luo, kimeru,
  zu, xh, swh, sot, afr,
}

function readLanguageFromStorage() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return 'en'
    const s = JSON.parse(raw)
    if (s.language && locales[s.language]) return s.language
  } catch {
    /* ignore */
  }
  return 'en'
}

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(readLanguageFromStorage)

  const setLang = useCallback((next) => {
    if (!next || !locales[next]) return
    setLangState(next)
    try {
      const defaults = { language: 'en', theme: 'light', notifications: true }
      const raw = localStorage.getItem(SETTINGS_KEY)
      const base = raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
      base.language = next
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(base))
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== SETTINGS_KEY || !e.newValue) return
      try {
        const s = JSON.parse(e.newValue)
        if (s.language && locales[s.language]) {
          setLangState(s.language)
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const pack = locales[lang] ?? en
    const t = { ...en, ...pack }
    return { t, lang, setLang }
  }, [lang, setLang])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
