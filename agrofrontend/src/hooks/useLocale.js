import { useState } from 'react'
import en      from '../locales/en.json'
import twi     from '../locales/twi.json'
import ga      from '../locales/ga.json'
import ewe     from '../locales/ewe.json'
import fante   from '../locales/fante.json'
import dagbani from '../locales/dagbani.json'
import gurene  from '../locales/gurene.json'
import yoruba  from '../locales/yoruba.json'
import kikuyu  from '../locales/kikuyu.json'
import luo     from '../locales/luo.json'
import kimeru  from '../locales/kimeru.json'
import zu      from '../locales/zu.json'
import xh      from '../locales/xh.json'
import swh     from '../locales/swh.json'
import sot     from '../locales/sot.json'
import afr     from '../locales/afr.json'

const locales = {
  en, twi, ga, ewe, fante, dagbani, gurene, yoruba, kikuyu, luo, kimeru,
  zu, xh, swh, sot, afr,
}

export function useLocale() {
  const [lang, setLang] = useState('en')
  const pack = locales[lang] ?? en
  const t = { ...en, ...pack }
  return { t, lang, setLang }
}
