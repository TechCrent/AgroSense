import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Camera } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import HistoryCard from '../components/HistoryCard.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'

function loadHistoryFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('agrosense_history') || '[]')
  } catch {
    return []
  }
}

export default function HistoryPage({ t, viewHistoryEntry }) {
  const navigate = useNavigate()
  const [history, setHistory] = useState(loadHistoryFromStorage)

  useEffect(() => {
    setHistory(loadHistoryFromStorage())
  }, [])

  const clearAll = () => {
    if (!window.confirm(t.history_clear_confirm)) return
    localStorage.removeItem('agrosense_history')
    setHistory([])
  }

  const deleteEntry = (id) => {
    const updated = history.filter((e) => e.id !== id)
    setHistory(updated)
    localStorage.setItem('agrosense_history', JSON.stringify(updated))
  }

  return (
    <div className="ag-page flex flex-col min-h-screen">
      <TopBar
        t={t}
        showLogo={false}
        title={t.history_title}
        rightElement={
          history.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-[#D94040] dark:text-red-400 font-semibold active:scale-[0.97] transition-transform duration-100 min-h-[44px] px-2"
            >
              {t.history_clear_all}
            </button>
          ) : null
        }
      />

      <div className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-4 md:pb-10">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 px-2 text-center py-16 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            <div className="w-24 h-24 bg-ag-green-50 dark:bg-[#1a2e24] rounded-3xl flex items-center justify-center mb-6 mx-auto animate-float">
              <Sprout size={48} color="#2D6A4F" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-ag-text-1 dark:text-[#e8ece9] text-lg">
              {t.history_empty}
            </p>
            <p className="text-sm text-ag-text-3 mt-2 leading-relaxed max-w-xs">
              {t.history_empty_sub}
            </p>
            <div className="mt-8 w-full max-w-xs">
              <PrimaryButton
                label={t.history_scan_now}
                icon={<Camera size={18} color="#FFFFFF" strokeWidth={2} />}
                onClick={() => navigate('/')}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
              >
                <HistoryCard
                  entry={entry}
                  t={t}
                  onDelete={deleteEntry}
                  onView={viewHistoryEntry}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
