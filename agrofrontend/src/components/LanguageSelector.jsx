import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { ChevronDown, Check, Languages } from 'lucide-react'
import { APP_LANG_CODES, langLabel } from '../i18n/langCodes.js'

function persistLanguageChoice(langValue) {
  try {
    const raw = localStorage.getItem('agrosense_settings')
    const base = raw
      ? { language: 'en', theme: 'light', notifications: true, ...JSON.parse(raw) }
      : { language: 'en', theme: 'light', notifications: true }
    base.language = langValue
    localStorage.setItem('agrosense_settings', JSON.stringify(base))
  } catch {
    /* ignore */
  }
}

/**
 * variant: "toolbar" — compact, for TopBar (truncates long names)
 * variant: "settings" — wider control for the settings row
 */
export default function LanguageSelector({
  lang,
  setLang,
  t,
  persistLanguage = false,
  variant = 'toolbar',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const uid = useId()
  const triggerId = `lang-trigger-${uid}`
  const listboxId = `lang-list-${uid}`

  const currentCode = APP_LANG_CODES.includes(lang) ? lang : 'en'
  const currentLabel = langLabel(t, currentCode)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function handlePointer(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) close()
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [close])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  function choose(value) {
    setLang(value)
    if (persistLanguage) persistLanguageChoice(value)
    close()
  }

  const isSettings = variant === 'settings'

  const triggerClass = isSettings
    ? `
      w-full min-w-[10.5rem] max-w-[14rem] sm:max-w-[16rem] justify-between
      pl-3 pr-3 py-2.5 text-sm font-semibold
    `
    : `
      max-w-[11rem] min-w-[7.25rem] justify-between gap-1.5
      pl-3 pr-2 py-2 text-sm font-semibold
    `

  return (
    <div ref={rootRef} className={`relative inline-flex shrink-0 ${className}`}>
      <button
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={t.language_label}
        onClick={() => setOpen((o) => !o)}
        className={`
          group inline-flex items-center rounded-xl border border-ag-border bg-ag-surface
          text-ag-text-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]
          transition-all duration-200
          hover:border-ag-green-300 hover:bg-ag-green-50/80
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ag-green-500 focus-visible:ring-offset-2 focus-visible:border-ag-green-500 dark:focus-visible:ring-offset-[#141c19]
          active:scale-[0.98]
          dark:border-[#2a3d34] dark:bg-[#141c19] dark:text-[#e8ece9]
          dark:hover:border-[#3d8f6c] dark:hover:bg-[#1a2e24]
          min-h-[44px]
          ${triggerClass}
        `}
      >
        {!isSettings && (
          <Languages
            size={17}
            className="shrink-0 text-ag-green-700 dark:text-ag-green-500 opacity-90"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        <span className={`truncate text-left ${isSettings ? 'flex-1' : ''}`}>{currentLabel}</span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`
            shrink-0 text-ag-text-3 transition-transform duration-200
            ${open ? 'rotate-180 text-ag-green-700 dark:text-ag-green-500' : ''}
          `}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={`
            absolute z-[60] mt-2 max-h-[min(60vh,22rem)] w-[min(calc(100vw-2.5rem),18rem)]
            overflow-hidden rounded-2xl border border-ag-border bg-ag-surface
            py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
            dark:border-[#2a3d34] dark:bg-[#141c19] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]
            animate-fade-up opacity-0 [animation-fill-mode:forwards]
            right-0
          `}
          style={{ animationDuration: '0.2s' }}
        >
          <div className="max-h-[min(60vh,21rem)] overflow-y-auto overscroll-contain px-1.5 pb-1">
            <p id={`${listboxId}-label`} className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-ag-text-3">
              {t.language_label}
            </p>
            <ul id={listboxId} role="listbox" aria-labelledby={`${listboxId}-label`} className="space-y-0.5">
              {APP_LANG_CODES.map((value) => {
                const selected = lang === value
                const label = langLabel(t, value)
                return (
                  <li key={value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => choose(value)}
                      className={`
                        flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm
                        transition-colors duration-150
                        active:scale-[0.99]
                        ${selected
                          ? 'bg-ag-green-50 font-semibold text-ag-green-700 dark:bg-[#1a2e24] dark:text-ag-green-400'
                          : 'text-ag-text-1 hover:bg-ag-bg dark:text-[#e8ece9] dark:hover:bg-[#1a2320]'
                        }
                      `}
                    >
                      <span
                        className={`
                          flex h-5 w-5 shrink-0 items-center justify-center rounded-full border
                          ${selected
                            ? 'border-ag-green-500 bg-ag-green-700 text-white dark:bg-ag-green-600'
                            : 'border-ag-border bg-transparent dark:border-[#3d4f6c]'
                          }
                        `}
                      >
                        {selected ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
