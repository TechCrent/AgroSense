import StatusBadge from '../components/StatusBadge.jsx'

const LANG_LABELS = {
  en: 'English', zu: 'Zulu', xh: 'Xhosa',
  swh: 'Swahili', sot: 'Sesotho', afr: 'Afrikaans',
}

export default function Result({ t, lang, result, imagePreview, resetAll }) {
  if (!result) return null

  const { plant, health, diagnosis } = result
  const isInfected = health.status === 'infected'

  return (
    <div className="bg-[#F8FFF9] min-h-screen">
      <div className="max-w-lg mx-auto">

        {/* Navbar */}
        <nav className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-[#2D6A4F] text-lg">🌿 AgroSense</span>
          <span className="text-xs text-[#555F61] bg-[#F0FFF4] rounded-full px-2 py-1">
            {LANG_LABELS[lang] ?? lang}
          </span>
        </nav>

        {/* Plant hero card */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-md">
          {imagePreview ? (
            <img src={imagePreview} alt={plant.common_name} className="w-full h-48 object-cover" />
          ) : (
            <div className="bg-[#F0FFF4] h-48 flex items-center justify-center text-6xl">🌿</div>
          )}
          <div className="bg-white px-4 py-4">
            <p className="text-2xl font-bold text-[#1B1B1B]">{plant.common_name}</p>
            <p className="text-sm italic text-[#555F61]">{plant.name}</p>
            <p className="text-xs text-[#555F61] mt-1">
              Plant match: {Math.round(plant.confidence * 100)}%
            </p>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={health.status} t={t} />
            </div>
          </div>
        </div>

        {/* Diagnosis section */}
        <div className="mx-4 mt-4">

          {isInfected ? (
            <>
              {/* Disease info card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#555F61]">
                  {t.disease_label}
                </p>
                <p className="text-xl font-bold text-[#E63946] mt-1">{health.disease_name}</p>
                <span className="inline-block mt-2 rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
                  {health.disease_type}
                </span>
                <p className="text-sm text-[#555F61] mt-2">
                  {t.confidence_label}: {Math.round(health.confidence * 100)}%
                </p>
              </div>

              {/* Summary card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
                <p className="text-sm text-[#1B1B1B] leading-relaxed">{diagnosis.summary}</p>
              </div>

              {/* Treatment steps card */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-bold text-[#2D6A4F] text-base mb-3">{t.result_treatment}</p>
                {diagnosis.steps.map((step, i) => (
                  <div key={i} className="flex gap-3 mb-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[#1B1B1B] leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Summary card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
                <p className="text-sm text-[#1B1B1B] leading-relaxed">{diagnosis.summary}</p>
              </div>

              {/* Prevention card */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-bold text-[#2D6A4F] text-base mb-3">{t.result_prevention}</p>
                {diagnosis.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 mb-3 items-start">
                    <span className="text-base flex-shrink-0">🌿</span>
                    <p className="text-sm text-[#1B1B1B] leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scan again button */}
        <div className="mx-4 mt-6 mb-8">
          <button
            onClick={resetAll}
            className="bg-[#2D6A4F] hover:bg-[#245a42] transition-colors text-white font-semibold py-4 rounded-2xl text-lg w-full"
          >
            {t.scan_again}
          </button>
        </div>

      </div>
    </div>
  )
}
