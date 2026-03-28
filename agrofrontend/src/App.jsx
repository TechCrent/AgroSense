import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useLocale } from './hooks/useLocale.js'
import { scanPlant, confirmPlant } from './api.js'
import { DEV_MODE, MOCK_CANDIDATES, MOCK_RESULT_INFECTED } from './mockData.js'
import Home from './pages/Home.jsx'
import SelectionScreen from './pages/SelectionScreen.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import Result from './pages/Result.jsx'

export default function App() {
  const { t, lang, setLang } = useLocale()
  const navigate = useNavigate()

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [result, setResult] = useState(null)
  const [screen, setScreen] = useState('upload')
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState(null)
  const [translating, setTranslating] = useState(false)

  // Drive URL from screen state
  useEffect(() => {
    if (screen === 'result') navigate('/result')
    else navigate('/')
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  function resetAll() {
    setImageFile(null)
    setImagePreview(null)
    setCandidates([])
    setSelectedPlant(null)
    setResult(null)
    setScreen('upload')
    setLoadingStep(0)
    setError(null)
    setTranslating(false)
  }

  async function handleScan() {
    setError(null)
    setScreen('loading')
    setLoadingStep(0)

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setCandidates(MOCK_CANDIDATES)
      setScreen('selection')
      return
    }

    try {
      const { data } = await scanPlant(imageFile)
      const list = data.candidates

      if (!list || list.length === 0) {
        setError(t.error_no_results)
        setScreen('upload')
        return
      }

      if (list.length === 1 && list[0].confidence > 0.90) {
        setCandidates(list)
        setSelectedPlant(list[0])
        await handleConfirm(list[0])
      } else {
        setCandidates(list)
        setScreen('selection')
      }
    } catch {
      setError(t.error_scan_failed)
      setScreen('upload')
    }
  }

  async function handleConfirm(plant) {
    setScreen('loading')
    setLoadingStep(1)

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 4000))
      setResult(MOCK_RESULT_INFECTED)
      setScreen('result')
      return
    }

    try {
      const { data } = await confirmPlant(imageFile, plant.common_name, lang)
      setResult(data)
      setScreen('result')
    } catch {
      setError(t.error_scan_failed)
      setScreen('selection')
    }
  }

  async function translateResult(targetLang) {
    if (!result) return
    setTranslating(true)

    if (DEV_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // In dev mode keep the same mock content but tag the target language
      setResult((prev) => ({
        ...prev,
        diagnosis: { ...prev.diagnosis, language: targetLang },
      }))
      setTranslating(false)
      return
    }

    try {
      const plant = selectedPlant ?? result.plant
      const { data } = await confirmPlant(imageFile, plant.common_name, targetLang)
      setResult(data)
    } catch {
      // silently keep existing result on failure
    } finally {
      setTranslating(false)
    }
  }

  const sharedProps = {
    t, lang, setLang,
    imageFile, setImageFile,
    imagePreview, setImagePreview,
    candidates, setCandidates,
    selectedPlant, setSelectedPlant,
    result, setResult,
    screen, setScreen,
    loadingStep, setLoadingStep,
    error, setError,
    translating,
    translateResult,
    resetAll,
    handleScan,
    handleConfirm,
  }

  const mainContent = screen === 'selection'
    ? <SelectionScreen {...sharedProps} />
    : <Home {...sharedProps} />

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            {mainContent}
            {screen === 'loading' && <LoadingScreen t={t} loadingStep={loadingStep} />}
          </>
        }
      />
      <Route
        path="/result"
        element={
          <Result
            t={t}
            lang={lang}
            result={result}
            imagePreview={imagePreview}
            translating={translating}
            translateResult={translateResult}
            resetAll={resetAll}
          />
        }
      />
    </Routes>
  )
}
