import { useState } from 'react'
import en from '../locales/en.json'
import zu from '../locales/zu.json'
import xh from '../locales/xh.json'
import swh from '../locales/swh.json'
import sot from '../locales/sot.json'
import afr from '../locales/afr.json'

const locales = { en, zu, xh, swh, sot, afr }

export function useLocale() {
  const [lang, setLang] = useState('en')
  const t = locales[lang]
  return { t, lang, setLang }
}
