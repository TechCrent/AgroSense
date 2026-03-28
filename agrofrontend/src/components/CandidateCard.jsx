import { useState } from 'react'

function confidenceColor(confidence) {
  if (confidence > 0.80) return 'bg-[#52B788]'
  if (confidence >= 0.50) return 'bg-[#F4A261]'
  return 'bg-[#9CA3AF]'
}

export default function CandidateCard({ candidate, isSelected, onSelect }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      onClick={onSelect}
      className={`
        relative rounded-2xl border-2 p-3 cursor-pointer
        transition-all duration-200 flex items-center gap-3
        ${isSelected
          ? 'bg-[#F0FFF4] border-[#2D6A4F] shadow-md'
          : 'bg-white border-[#D8E8DF] hover:border-[#52B788] hover:shadow-md'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#2D6A4F] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
          ✓
        </div>
      )}

      {/* Plant image */}
      {imgError ? (
        <div className="w-20 h-20 rounded-xl bg-[#F0FFF4] flex items-center justify-center text-3xl flex-shrink-0">
          🌿
        </div>
      ) : (
        <img
          src={candidate.image_url}
          alt={candidate.common_name}
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          onError={() => setImgError(true)}
        />
      )}

      {/* Names */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1B1B1B] text-base leading-tight">{candidate.common_name}</p>
        <p className="text-sm italic text-[#555F61] mt-0.5 truncate">{candidate.name}</p>
      </div>

      {/* Confidence badge */}
      <div className={`${confidenceColor(candidate.confidence)} rounded-full px-3 py-1 text-xs font-bold text-white flex-shrink-0`}>
        {Math.round(candidate.confidence * 100)}%
      </div>
    </div>
  )
}
