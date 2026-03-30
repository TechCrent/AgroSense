import { useCallback, useRef, useState } from 'react'
import { Globe, Palette, Bell, Trash2, Leaf } from 'lucide-react'
import LanguageSelector from '../components/LanguageSelector.jsx'
import Toast from '../components/Toast.jsx'
import TopBar from '../components/TopBar.jsx'

const DEFAULT_SETTINGS = {
  language: 'en',
  theme: 'light',
  notifications: true,
}

function readSettings() {
  try {
    const raw = localStorage.getItem('agrosense_settings')
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function writeSettings(partial) {
  const next = { ...readSettings(), ...partial }
  localStorage.setItem('agrosense_settings', JSON.stringify(next))
  return next
}

export default function SettingsPage({ t, lang, setLang, theme, setTheme }) {
  const [notifications, setNotifications] = useState(() => readSettings().notifications)
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimerRef = useRef(null)

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, visible: true })
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, 2000)
  }, [])

  const handleLangChange = (newLang) => {
    setLang(newLang)
    writeSettings({ language: newLang })
    showToast(t.settings_saved)
  }

  const setThemeMode = (mode) => {
    setTheme(mode)
    writeSettings({ theme: mode })
    showToast(t.settings_saved)
  }

  const toggleNotifications = () => {
    const next = !notifications
    setNotifications(next)
    writeSettings({ notifications: next })
    showToast(t.settings_saved)
  }

  const clearHistory = () => {
    if (!window.confirm(t.history_clear_confirm)) return
    localStorage.removeItem('agrosense_history')
    showToast(t.settings_saved)
  }

  return (
    <div className="ag-page">
      <TopBar t={t} showLogo={false} title={t.settings_title} />

      <div className="mx-auto max-w-md space-y-0 px-5 pb-24 pt-2 md:pb-10">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 px-1 mb-2 mt-4">
          {t.settings_section_preferences}
        </p>
        <section className="bg-ag-surface dark:bg-[#141c19] rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-ag-border overflow-visible">
          <div className="px-5 py-4 flex items-center gap-4 border-b border-[#F5F5F5] dark:border-[#2a3d34] last:border-0">
            <div className="w-9 h-9 rounded-xl bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center flex-shrink-0">
              <Globe size={18} color="#2D6A4F" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ag-text-1 dark:text-[#e8ece9] text-sm">{t.settings_language}</p>
              <p className="text-xs text-ag-text-3 mt-0.5">{t.settings_language_sub}</p>
            </div>
            <LanguageSelector lang={lang} setLang={handleLangChange} t={t} variant="settings" />
          </div>
        </section>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 px-1 mb-2 mt-5">
          {t.settings_section_appearance}
        </p>
        <section className="bg-ag-surface dark:bg-[#141c19] rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-ag-border overflow-hidden">
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center flex-shrink-0">
                <Palette size={18} color="#2D6A4F" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ag-text-1 dark:text-[#e8ece9] text-sm">{t.settings_theme}</p>
                <p className="text-xs text-ag-text-3 mt-0.5">{t.settings_theme_sub}</p>
              </div>
            </div>
            <div className="bg-[#F0F0F0] dark:bg-[#252a28] rounded-full p-1 flex shrink-0 self-stretch sm:self-center active:scale-[0.97] transition-transform">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`text-sm px-3 py-2 rounded-full transition-all min-h-[44px] active:scale-[0.98] ${
                  theme === 'light'
                    ? 'bg-white dark:bg-[#1a2320] shadow-sm text-ag-green-700 dark:text-ag-green-500 font-semibold'
                    : 'text-ag-text-3'
                }`}
              >
                {t.settings_theme_light}
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`text-sm px-3 py-2 rounded-full transition-all min-h-[44px] active:scale-[0.98] ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-[#1a2320] shadow-sm text-ag-green-700 dark:text-ag-green-500 font-semibold'
                    : 'text-ag-text-3'
                }`}
              >
                {t.settings_theme_dark}
              </button>
            </div>
          </div>
        </section>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 px-1 mb-2 mt-5">
          {t.settings_section_notifications}
        </p>
        <section className="bg-ag-surface dark:bg-[#141c19] rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-ag-border overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center flex-shrink-0">
              <Bell size={18} color="#2D6A4F" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ag-text-1 dark:text-[#e8ece9] text-sm">{t.settings_notifications}</p>
              <p className="text-xs text-ag-text-3 mt-0.5">{t.settings_notifications_sub}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifications}
              onClick={toggleNotifications}
              className={`
                w-12 h-8 rounded-full transition-colors duration-200
                flex items-center px-1 cursor-pointer shrink-0 active:scale-[0.97]
                ${notifications ? 'bg-ag-green-700' : 'bg-[#D8E8DF] dark:bg-[#3d4f47]'}
              `}
            >
              <span
                className={`
                  w-5 h-5 bg-white rounded-full shadow-sm
                  transition-transform duration-200
                  ${notifications ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </section>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 px-1 mb-2 mt-5">
          {t.settings_section_data}
        </p>
        <section className="bg-ag-surface dark:bg-[#141c19] rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-ag-border overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-4 border-b border-[#F5F5F5] dark:border-[#2a3d34] last:border-0">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} color="#D94040" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ag-text-1 dark:text-[#e8ece9] text-sm">{t.settings_clear_history}</p>
              <p className="text-xs text-ag-text-3 mt-0.5">{t.settings_clear_history_sub}</p>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="bg-red-50 dark:bg-red-950/40 text-[#D94040] dark:text-red-400 text-sm font-semibold px-3 py-2 rounded-xl shrink-0 active:scale-[0.97] transition-transform min-h-[44px]"
            >
              {t.settings_clear_btn}
            </button>
          </div>
        </section>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 px-1 mb-2 mt-5">
          {t.settings_section_about}
        </p>
        <div className="mx-0 mt-1 bg-gradient-to-br from-[#1A3C2E] to-[#2D6A4F] rounded-3xl p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex justify-center mb-3 animate-float">
            <Leaf size={40} color="#95D5B2" strokeWidth={1.5} />
          </div>
          <p className="text-white font-bold text-lg">{t.app_name}</p>
          <p className="text-[#95D5B2] text-xs mt-1">{t.settings_version}</p>
          <p className="text-[#95D5B2]/70 text-xs mt-3 leading-relaxed">{t.settings_built_with}</p>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
