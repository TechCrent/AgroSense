import LanguageSelector from '../components/LanguageSelector.jsx'
import UploadZone from '../components/UploadZone.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Home({
  t, lang, setLang,
  imageFile, setImageFile,
  imagePreview, setImagePreview,
  error, setError,
  handleScan,
}) {
  return (
    <div className="min-h-screen bg-[#F8FFF9]">
      <div className="max-w-lg mx-auto animate-fadeIn">

        {/* Navbar */}
        <nav className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-[#2D6A4F] text-lg">🌿 AgroSense</span>
          <LanguageSelector lang={lang} setLang={setLang} t={t} />
        </nav>

        {/* Hero */}
        <div className="pt-8 md:pt-12 pb-4 px-4 text-center">
          <h1 className="text-2xl font-bold text-[#2D6A4F]">{t.tagline}</h1>
          <p className="text-sm text-[#555F61] mt-1">AI-powered plant health diagnosis</p>
        </div>

        {/* Upload Zone */}
        <div className="px-4">
          <UploadZone
            t={t}
            imageFile={imageFile}
            imagePreview={imagePreview}
            setImageFile={setImageFile}
            setImagePreview={setImagePreview}
            setError={setError}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 mt-3">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Scan Button */}
        <div className="px-4 mt-4">
          <button
            onClick={handleScan}
            disabled={!imageFile}
            className={`
              w-full py-4 rounded-2xl text-lg font-semibold text-white transition-colors
              ${imageFile
                ? 'bg-[#2D6A4F] hover:bg-[#245a42] cursor-pointer'
                : 'bg-[#2D6A4F] opacity-50 cursor-not-allowed'
              }
            `}
          >
            {t.scan_button}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-4">
          <p className="text-xs text-[#555F61]">Powered by Plant.id · Claude · Khaya AI</p>
        </div>

      </div>
    </div>
  )
}
