import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useLocale } from './hooks/useLocale.js'
import { scanPlant, confirmPlant } from './api.js'
import { DEV_MODE, MOCK_CANDIDATES, MOCK_RESULT_INFECTED } from './mockData.js'
import Home from './pages/Home.jsx'
import SelectionScreen from './pages/SelectionScreen.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import Result from './pages/Result.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import BottomNav from './components/BottomNav.jsx'
import AppShell from './components/AppShell.jsx'

const SETTINGS_KEY = 'agrosense_settings'
const DEFAULT_SETTINGS = { language: 'en', theme: 'light', notifications: true }

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function saveToHistory(result, imagePreview, lang) {
  const existing = JSON.parse(localStorage.getItem('agrosense_history') || '[]')
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    imagePreview,
    plant: result.plant,
    health: result.health,
    diagnosis: result.diagnosis,
    lang,
  }
  const updated = [entry, ...existing].slice(0, 20)
  localStorage.setItem('agrosense_history', JSON.stringify(updated))
}

export default function App() {
  const { t, lang, setLang } = useLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const appColumnRef = useRef(null)

  useEffect(() => {
    appColumnRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const [theme, setTheme] = useState(() => {
    const s = readSettings()
    return s.theme === 'dark' ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const s = readSettings()
    if (s.language) setLang(s.language)
    if (s.theme === 'light' || s.theme === 'dark') setTheme(s.theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [result, setResult] = useState(null)
  const [screen, setScreen] = useState('upload')
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState(null)
  const [translating, setTranslating] = useState(false)

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
    navigate('/')
  }

  const viewHistoryEntry = (entry) => {
    setResult({
      plant: entry.plant,
      health: entry.health,
      diagnosis: entry.diagnosis,
    })
    setImagePreview(entry.imagePreview)
    setScreen('result')
    navigate('/result')
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
      saveToHistory(MOCK_RESULT_INFECTED, imagePreview, lang)
      setScreen('result')
      navigate('/result')
      return
    }

    try {
      const { data } = await confirmPlant(imageFile, plant.common_name, lang)
      setResult(data)
      saveToHistory(data, imagePreview, lang)
      setScreen('result')
      navigate('/result')
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
    <AppShell appColumnRef={appColumnRef} t={t}>
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
          path="/history"
          element={<HistoryPage t={t} viewHistoryEntry={viewHistoryEntry} />}
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              t={t}
              lang={lang}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
            />
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
      <BottomNav t={t} />
    </AppShell>
  )
}
