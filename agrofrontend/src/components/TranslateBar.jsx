import { useState } from 'react'

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

export default function TranslateBar({ translating, translateResult, diagnosisLang }) {
  const [open, setOpen] = useState(false)

  const currentLabel = LANGUAGES.find((l) => l.value === diagnosisLang)?.label ?? 'English'

  function handleSelect(langValue) {
    if (langValue === diagnosisLang || translating) return
    setOpen(false)
    translateResult(langValue)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#555F61]">
              Translate Diagnosis
            </p>
            {!translating && (
              <p className="text-xs text-[#2D6A4F] mt-0.5 font-medium">
                Currently in: {currentLabel}
              </p>
            )}
            {translating && (
              <p className="text-xs text-[#555F61] mt-0.5 flex items-center gap-1">
                <span className="inline-block w-3 h-3 border-2 border-[#D8E8DF] border-t-[#2D6A4F] rounded-full animate-spin" />
                Translating...
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => !translating && setOpen((o) => !o)}
          disabled={translating}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
            ${translating
              ? 'border-[#D8E8DF] text-[#9CA3AF] cursor-not-allowed'
              : open
                ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                : 'border-[#52B788] text-[#2D6A4F] hover:bg-[#F0FFF4]'
            }
          `}
        >
          {open ? 'Close ✕' : 'Change ▾'}
        </button>
      </div>

      {/* Language grid */}
      {open && !translating && (
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${value === diagnosisLang
                  ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                  : 'bg-white text-[#2D6A4F] border-[#52B788] hover:bg-[#F0FFF4]'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
