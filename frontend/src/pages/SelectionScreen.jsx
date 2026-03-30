import { ArrowLeft } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import CandidateCard from '../components/CandidateCard.jsx'
import LanguageSelector from '../components/LanguageSelector.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'

export default function SelectionScreen({
  t, lang, setLang,
  candidates, selectedPlant, setSelectedPlant,
  handleConfirm, resetAll,
  error, setError,
}) {
  return (
    <div className="ag-page">
      <div className="mx-auto max-w-md pb-48 opacity-0 animate-fade-up md:pb-28" style={{ animationFillMode: 'forwards' }}>

        <TopBar
          t={t}
          title={t.select_prompt}
          rightElement={<LanguageSelector lang={lang} setLang={setLang} t={t} persistLanguage />}
        />

        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1 bg-ag-green-700 rounded-full" />
            <div className="flex-1 h-1 bg-ag-green-100 dark:bg-[#1a2e24] rounded-full" />
            <div className="flex-1 h-1 bg-ag-green-100 dark:bg-[#1a2e24] rounded-full" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ag-text-3">
            {t.step_1_of_3}
          </p>
        </div>

        <div className="px-5 space-y-4">
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 text-ag-green-700 dark:text-ag-green-500 text-sm font-medium hover:underline active:scale-[0.97] transition-transform duration-100 min-h-[44px]"
          >
            <ArrowLeft size={16} color="currentColor" strokeWidth={2} className="flex-shrink-0" aria-hidden />
            {t.reupload_link}
          </button>
          <h2 className="text-xl font-bold text-ag-text-1 dark:text-[#e8ece9]">{t.select_prompt}</h2>
          <p className="text-sm text-ag-text-2 dark:text-[#9ca8a3] leading-relaxed">{t.select_subtitle}</p>
        </div>

        <div className="px-5 mt-4 space-y-4 pb-8">
          {candidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.name}
              candidate={candidate}
              isSelected={selectedPlant?.name === candidate.name}
              onSelect={() => setSelectedPlant(candidate)}
              index={index}
              t={t}
            />
          ))}
        </div>

        <div
          className="fixed bottom-24 left-0 right-0 z-30 mx-auto max-w-md px-5 pb-[env(safe-area-inset-bottom,0px)] md:bottom-8"
        >
          <div className="bg-white/95 dark:bg-[#141c19]/95 backdrop-blur-xl border border-ag-border dark:border-[#2a3d34] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5">
            {error && (
              <div className="mb-3">
                <ErrorMessage t={t} message={error} onDismiss={() => setError(null)} />
              </div>
            )}
            <PrimaryButton
              label={t.confirm_button}
              onClick={() => selectedPlant && handleConfirm(selectedPlant)}
              disabled={!selectedPlant}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
