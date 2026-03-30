import { useState, useEffect } from 'react'
import { Leaf, Check } from 'lucide-react'
import ConfidenceBar from './ConfidenceBar.jsx'

export default function CandidateCard({ candidate, isSelected, onSelect, index = 0 }) {
  const [imgError, setImgError] = useState(false)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    if (!isSelected) return
    setBounce(true)
    const id = setTimeout(() => setBounce(false), 200)
    return () => clearTimeout(id)
  }, [isSelected])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'forwards',
      }}
      className={`
        opacity-0 animate-fade-up bg-ag-surface rounded-3xl p-5 flex gap-4 items-center
        border-2 transition-all duration-200 cursor-pointer
        shadow-[0_2px_16px_rgba(0,0,0,0.06)]
        hover:shadow-md hover:-translate-y-0.5 hover:border-ag-green-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ag-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141c19]
        active:scale-[0.98]
        dark:bg-[#141c19]
        ${bounce ? 'scale-[1.02]' : 'scale-100'}
        ${isSelected
          ? 'border-ag-green-700 bg-ag-green-50 shadow-[0_4px_20px_rgba(45,106,79,0.2)] dark:border-ag-green-500 dark:bg-[#1a2e24]'
          : 'border-transparent hover:border-ag-green-300 dark:hover:border-[#3d8f6c]'
        }
      `}
    >
      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-ag-green-50 dark:bg-[#1a2e24]">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf size={28} color="#95D5B2" strokeWidth={1.5} />
          </div>
        ) : (
          <img
            src={candidate.image_url}
            alt={candidate.common_name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-ag-text-1 text-base leading-tight dark:text-[#e8ece9]">
          {candidate.common_name}
        </p>
        <p className="text-xs italic text-ag-text-3 mt-0.5 truncate">
          {candidate.name}
        </p>
        <div className="mt-3">
          <ConfidenceBar confidence={candidate.confidence} />
        </div>
      </div>

      {isSelected && (
        <div className="w-7 h-7 rounded-full bg-ag-green-700 flex items-center justify-center flex-shrink-0 animate-scale-in-ui">
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        </div>
      )}
    </div>
  )
}
