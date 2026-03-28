import { Navigate } from 'react-router-dom'
import { Bug, Leaf } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import TranslateBar from '../components/TranslateBar.jsx'
import ConfidenceBar from '../components/ConfidenceBar.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import { langLabel } from '../i18n/langCodes.js'

export default function Result({ t, lang, result, imagePreview, translating, translateResult, resetAll }) {
  if (!result) return <Navigate to="/" replace />

  const { plant, health, diagnosis } = result
  const isInfected = health.status === 'infected'
  const diagnosisLang = diagnosis.language ?? 'en'

  return (
    <div className="ag-page">
      <div className="mx-auto max-w-md pb-24 opacity-0 animate-fade-up md:pb-10" style={{ animationFillMode: 'forwards' }}>

        <TopBar
          t={t}
          title={t.nav_scan}
          rightElement={(
            <span className="text-xs text-ag-text-3 bg-ag-green-50 dark:bg-[#1a2e24] rounded-full px-2 py-1 font-medium">
              {langLabel(t, lang)}
            </span>
          )}
        />

        <div className="flex gap-2 px-5 pt-2 pb-4">
          <div className="flex-1 h-1 bg-ag-green-700 rounded-full" />
          <div className="flex-1 h-1 bg-ag-green-700 rounded-full" />
          <div className="flex-1 h-1 bg-ag-green-700 rounded-full" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3 px-5 -mt-2 mb-2">
          {t.step_3_of_3}
        </p>

        <div
          className="mx-5 mt-2 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-scale-in-ui"
        >
          <div className="relative h-52">
            {imagePreview ? (
              <img src={imagePreview} alt={plant.common_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center">
                <Leaf size={48} color="#95D5B2" strokeWidth={1.5} />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-xl leading-tight drop-shadow">
                {plant.common_name}
              </p>
              <p className="text-white/70 text-xs italic mt-0.5">{plant.name}</p>
            </div>
          </div>
          <div className="bg-ag-surface dark:bg-[#141c19] px-5 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <StatusBadge status={health.status} t={t} />
            <div className="flex-1 min-w-0 max-w-full sm:max-w-[200px] sm:ml-auto">
              <ConfidenceBar confidence={plant.confidence} label={t.confidence_label} />
            </div>
          </div>
        </div>

        <div className="mx-5 mt-4">
          <TranslateBar
            t={t}
            translating={translating}
            translateResult={translateResult}
            diagnosisLang={diagnosisLang}
          />

          <div className={`relative transition-opacity duration-300 ${translating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

            {translating && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-[#D8E8DF] dark:border-[#3d4f47] border-t-ag-green-700 rounded-full animate-spin" />
                <p className="text-sm font-medium text-ag-green-700 dark:text-ag-green-500">{t.translating}</p>
              </div>
            )}

            {isInfected ? (
              <>
                <div
                  className="bg-ag-surface dark:bg-[#141c19] rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-[#FBCACA] dark:border-[#6b3030] opacity-0 animate-fade-up mt-4"
                  style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
                      <Bug size={20} color="#D94040" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3">
                        {t.disease_label}
                      </p>
                      <p className="font-bold text-[#D94040] text-lg leading-tight mt-0.5">
                        {health.disease_name}
                      </p>
                      {health.disease_type ? (
                        <span className="inline-block mt-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-semibold px-3 py-1 rounded-full border border-red-100 dark:border-red-900/50">
                          {health.disease_type}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4">
                    <ConfidenceBar confidence={health.confidence} label={t.confidence_label} />
                  </div>
                </div>

                <div
                  className="bg-ag-surface dark:bg-[#141c19] rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-ag-border opacity-0 animate-fade-up mt-4"
                  style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                >
                  <p className="text-sm text-ag-text-1 dark:text-[#e8ece9] leading-relaxed">{diagnosis.summary}</p>
                </div>

                <div
                  className="mt-4 opacity-0 animate-fade-up"
                  style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
                >
                  <p className="font-bold text-ag-text-1 dark:text-[#e8ece9] text-base mb-3 px-1">
                    {t.result_treatment}
                  </p>
                  <div className="space-y-3">
                    {diagnosis.steps.map((step, i) => (
                      <div
                        key={i}
                        className="bg-ag-surface dark:bg-[#141c19] rounded-2xl p-4 flex gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-ag-border opacity-0 animate-fade-up"
                        style={{
                          animationDelay: `${i * 80 + 300}ms`,
                          animationFillMode: 'forwards',
                        }}
                      >
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-ag-green-700 to-ag-green-500 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(45,106,79,0.35)]">
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-ag-text-1 dark:text-[#e8ece9] leading-relaxed flex-1 pt-0.5">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="bg-ag-surface dark:bg-[#141c19] rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)] border border-ag-border opacity-0 animate-fade-up mt-4"
                  style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
                >
                  <p className="text-sm text-ag-text-1 dark:text-[#e8ece9] leading-relaxed">{diagnosis.summary}</p>
                </div>

                <div
                  className="mt-4 opacity-0 animate-fade-up"
                  style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                >
                  <p className="font-bold text-ag-green-700 dark:text-ag-green-500 text-base mb-3 px-1">
                    {t.result_prevention}
                  </p>
                  <div className="space-y-3">
                    {diagnosis.steps.map((step, i) => (
                      <div
                        key={i}
                        className="bg-ag-surface dark:bg-[#141c19] rounded-2xl p-4 flex gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-ag-border opacity-0 animate-fade-up"
                        style={{
                          animationDelay: `${i * 80 + 200}ms`,
                          animationFillMode: 'forwards',
                        }}
                      >
                        <div className="w-7 h-7 rounded-xl bg-ag-green-50 dark:bg-[#1a2e24] flex items-center justify-center flex-shrink-0">
                          <Leaf size={16} color="#52B788" strokeWidth={2} />
                        </div>
                        <p className="text-sm text-ag-text-1 dark:text-[#e8ece9] leading-relaxed flex-1 pt-0.5">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mx-5 mt-6 mb-8">
          <PrimaryButton label={t.scan_again} onClick={resetAll} />
        </div>

      </div>
    </div>
  )
}
