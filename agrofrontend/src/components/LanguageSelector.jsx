const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zu', label: 'Zulu' },
  { value: 'xh', label: 'Xhosa' },
  { value: 'swh', label: 'Swahili' },
  { value: 'sot', label: 'Sesotho' },
  { value: 'afr', label: 'Afrikaans' },
]

export default function LanguageSelector({ lang, setLang, t }) {
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label={t.language_label}
      className="border border-green-300 rounded-lg px-2 py-1 text-sm text-green-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      {LANGUAGES.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
}
