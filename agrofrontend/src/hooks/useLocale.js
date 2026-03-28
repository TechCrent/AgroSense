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

const locales = { en, twi, ga, ewe, fante, dagbani, gurene, yoruba, kikuyu, luo, kimeru }

export function useLocale() {
  const [lang, setLang] = useState('en')
  const t = locales[lang]
  return { t, lang, setLang }
}
