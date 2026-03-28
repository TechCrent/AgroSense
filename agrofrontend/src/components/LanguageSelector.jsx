const LANGUAGES = [
  { value: 'en',      label: 'English'  },
  { value: 'twi',     label: 'Twi'      },
  { value: 'ga',      label: 'Ga'       },
  { value: 'ewe',     label: 'Ewe'      },
  { value: 'fante',   label: 'Fante'    },
  { value: 'dagbani', label: 'Dagbani'  },
  { value: 'gurene',  label: 'Gurene'   },
  { value: 'yoruba',  label: 'Yoruba'   },
  { value: 'kikuyu',  label: 'Kikuyu'   },
  { value: 'luo',     label: 'Luo'      },
  { value: 'kimeru',  label: 'Kimeru'   },
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
