import CandidateCard from '../components/CandidateCard.jsx'
import LanguageSelector from '../components/LanguageSelector.jsx'

export default function SelectionScreen({
  t, lang, setLang,
  candidates, selectedPlant, setSelectedPlant,
  handleConfirm, resetAll,
}) {
  return (
    <div className="min-h-screen bg-[#F8FFF9]">
      <div className="max-w-lg mx-auto">

        {/* Navbar */}
        <nav className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-[#2D6A4F] text-lg">🌿 AgroSense</span>
          <LanguageSelector lang={lang} setLang={setLang} t={t} />
        </nav>

        {/* Header */}
        <div className="px-4 pt-6 pb-3">
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-[#2D6A4F] text-sm font-medium hover:underline"
          >
            ← {t.reupload_link}
          </button>
          <h2 className="text-xl font-bold text-[#1B1B1B] mt-3">{t.select_prompt}</h2>
          <p className="text-sm text-[#555F61] mt-1">{t.select_subtitle}</p>
        </div>

        {/* Candidate list */}
        <div className="px-4 mt-4 pb-32">
          {candidates.map((candidate) => (
            <div key={candidate.name} className="mb-3">
              <CandidateCard
                candidate={candidate}
                isSelected={selectedPlant?.name === candidate.name}
                onSelect={() => setSelectedPlant(candidate)}
              />
            </div>
          ))}
        </div>

        {/* Sticky confirm bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D8E8DF] px-4 py-4 shadow-lg">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => selectedPlant && handleConfirm(selectedPlant)}
              disabled={!selectedPlant}
              className={`
                w-full py-4 rounded-2xl text-lg font-semibold text-white transition-colors
                ${selectedPlant
                  ? 'bg-[#2D6A4F] hover:bg-[#245a42] cursor-pointer'
                  : 'bg-[#2D6A4F] opacity-50 cursor-not-allowed'
                }
              `}
            >
              {t.confirm_button}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
