import { useState } from 'react'
import { Globe } from 'lucide-react'
import { APP_LANG_CODES, langLabel } from '../i18n/langCodes.js'
import { interpolate } from '../i18n/interpolate.js'

export default function TranslateBar({ t, translating, translateResult, diagnosisLang }) {
  const [open, setOpen] = useState(false)

  const currentName = langLabel(t, diagnosisLang)
  const currentlyLine = interpolate(t.translate_currently_in, { name: currentName })

  function handleSelect(langValue) {
    if (langValue === diagnosisLang || translating) return
    setOpen(false)
    translateResult(langValue)
  }

  return (
    <div className="ag-card rounded-2xl shadow-sm dark:shadow-none p-4 mb-3 border ag-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Globe size={16} color="#2D6A4F" strokeWidth={1.75} className="flex-shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest ag-text-muted">
              {t.translate_diagnosis_title}
            </p>
            {!translating && (
              <p className="text-xs ag-text-brand mt-0.5 font-medium truncate">
                {currentlyLine}
              </p>
            )}
            {translating && (
              <p className="text-xs ag-text-muted mt-0.5 flex items-center gap-1">
                <span className="inline-block w-3 h-3 border-2 border-[#D8E8DF] dark:border-[#3d4f47] border-t-[#2D6A4F] rounded-full animate-spin" />
                {t.translating}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => !translating && setOpen((o) => !o)}
          disabled={translating}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors shrink-0
            ${translating
              ? 'border ag-border text-[#9CA3AF] cursor-not-allowed'
              : open
                ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                : 'border-[#52B788] dark:border-[#3d8f6c] ag-text-brand hover:bg-[#F0FFF4] dark:hover:bg-[#1a2e24]'
            }
          `}
        >
          {open ? t.translate_close : t.translate_change}
        </button>
      </div>

      {open && !translating && (
        <div className="mt-3 flex flex-wrap gap-2">
          {APP_LANG_CODES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSelect(value)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${value === diagnosisLang
                  ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                  : 'ag-card ag-text-brand border-[#52B788] dark:border-[#3d8f6c] hover:bg-[#F0FFF4] dark:hover:bg-[#1a2e24]'
                }
              `}
            >
              {langLabel(t, value)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
