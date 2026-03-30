import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Clock, Zap, Microscope, Lightbulb, ScanLine } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import LanguageSelector from '../components/LanguageSelector.jsx'
import UploadZone from '../components/UploadZone.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function Home({
  t, lang, setLang,
  imageFile, setImageFile,
  imagePreview, setImagePreview,
  error, setError,
  handleScan,
}) {
  const navigate = useNavigate()
  const [lastScan, setLastScan] = useState(null)

  useEffect(() => {
    try {
      const history = JSON.parse(
        localStorage.getItem('agrosense_history') || '[]',
      )
      if (history.length > 0) {
        setLastScan(history[0])
      }
    } catch {
      setLastScan(null)
    }
  }, [])

  return (
    <div className="ag-page">
      <div className="mx-auto max-w-md pb-24 opacity-0 animate-fade-up md:pb-10" style={{ animationFillMode: 'forwards' }}>

        <TopBar
          t={t}
          title={t.nav_scan}
          rightElement={<LanguageSelector lang={lang} setLang={setLang} t={t} persistLanguage />}
        />

        <div className="px-5 mt-4 space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1A3C2E] to-[#2D6A4F] px-6 pb-16 pt-8 md:pt-12">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" aria-hidden />
              <div className="absolute -bottom-12 -left-4 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden />
              <div className="relative mb-4 animate-float" aria-hidden>
                <Leaf size={56} color="#95D5B2" strokeWidth={1.5} />
              </div>
              <h2 className="text-white font-bold text-2xl leading-tight tracking-tight">
                {t.tagline}
              </h2>
              <p className="text-[#95D5B2] text-sm mt-2 font-medium">
                {t.hero_subtitle}
              </p>
            </div>
            <div className="-mt-8 mx-4 mb-0">
              <UploadZone
                t={t}
                imageFile={imageFile}
                imagePreview={imagePreview}
                setImageFile={setImageFile}
                setImagePreview={setImagePreview}
                setError={setError}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="px-5 mt-3">
            <ErrorMessage t={t} message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="px-5 mt-4">
          {imageFile ? (
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-ag-green-500/20 animate-ping pointer-events-none" aria-hidden />
              <PrimaryButton
                label={t.scan_button}
                icon={<ScanLine size={20} color="#FFFFFF" strokeWidth={2} />}
                onClick={handleScan}
                disabled={!imageFile}
              />
            </div>
          ) : (
            <PrimaryButton
              label={t.scan_button}
              icon={<ScanLine size={20} color="#FFFFFF" strokeWidth={2} />}
              onClick={handleScan}
              disabled={!imageFile}
            />
          )}
        </div>

        <div
          className="grid grid-cols-2 gap-3 mx-5 mt-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          {lastScan ? (
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="bg-ag-surface dark:bg-[#1a2320] border border-ag-border rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-left cursor-pointer hover:shadow-md hover:border-ag-green-300 dark:hover:border-ag-green-500/50 transition-all duration-200 active:scale-[0.97] min-h-[44px]"
            >
              <Clock size={14} color="#8FA89D" strokeWidth={2.5} aria-hidden />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 dark:text-[#9ca8a3]">
                {t.last_scan_label}
              </p>
              <p className="mt-1 font-bold text-sm text-ag-text-1 dark:text-[#e8ece9] leading-tight truncate max-w-full">
                {lastScan.plant.common_name}
              </p>
              <div className="mt-1">
                <StatusBadge status={lastScan.health.status} t={t} size="small" />
              </div>
            </button>
          ) : (
            <div className="bg-ag-surface dark:bg-[#1a2320] border border-ag-border rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-default min-h-[44px]">
              <Clock size={14} color="#8FA89D" strokeWidth={2.5} aria-hidden />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 dark:text-[#9ca8a3]">
                {t.last_scan_label}
              </p>
              <p className="mt-1 text-sm text-ag-text-3 dark:text-[#9ca8a3] font-medium">
                {t.last_scan_empty}
              </p>
            </div>
          )}

          <div className="relative overflow-hidden bg-gradient-to-br from-[#1A3C2E] to-[#2D6A4F] rounded-3xl p-5 shadow-[0_4px_16px_rgba(45,106,79,0.3)] min-h-[44px]">
            <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 pointer-events-none" aria-hidden />
            <span className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/5 pointer-events-none" aria-hidden />
            <div className="relative" aria-hidden>
              <Zap size={14} color="#95D5B2" fill="#95D5B2" strokeWidth={2} />
            </div>
            <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-widest text-[#95D5B2]/80">
              {t.ai_accuracy_label}
            </p>
            <p className="relative mt-1 font-bold text-white text-sm leading-tight">
              {t.ai_accuracy_value}
            </p>
          </div>
        </div>

        <div
          className="mt-4 mx-5 bg-ag-surface dark:bg-[#1a2320] rounded-3xl p-5 border border-ag-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-start gap-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          <div className="w-11 h-11 rounded-2xl bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center flex-shrink-0">
            <Microscope size={20} color="#2D6A4F" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-ag-text-1 dark:text-[#e8ece9]">{t.lab_precision_title}</p>
            <p className="text-xs text-ag-text-2 dark:text-[#9ca8a3] mt-1 leading-relaxed">
              {t.lab_precision_body}
            </p>
          </div>
        </div>

        <div
          className="mt-4 mx-5 mb-6 bg-ag-surface dark:bg-[#1a2320] rounded-3xl p-5 border border-ag-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-start gap-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          <div className="w-11 h-11 rounded-2xl bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center flex-shrink-0">
            <Lightbulb size={20} color="#2D6A4F" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-ag-text-1 dark:text-[#e8ece9]">{t.expert_insights_title}</p>
            <p className="text-xs text-ag-text-2 dark:text-[#9ca8a3] mt-1 leading-relaxed">
              {t.expert_insights_body}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center pb-4 px-5">
          <p className="text-xs text-ag-text-2">{t.footer_powered_by}</p>
        </div>

      </div>
    </div>
  )
}
