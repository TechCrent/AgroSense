import { useState } from 'react'
import { Leaf, X } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import { interpolate } from '../i18n/interpolate.js'

export function formatHistoryTime(isoString, t) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return t.history_time_just_now
  if (mins < 60) return interpolate(t.history_time_mins, { n: String(mins) })
  if (hours < 24) return interpolate(t.history_time_hours, { n: String(hours) })
  return interpolate(t.history_time_days, { n: String(days) })
}

export default function HistoryCard({ entry, t, onDelete, onView }) {
  const [imgErr, setImgErr] = useState(false)
  const showThumb = entry.imagePreview && !imgErr

  return (
    <div className="bg-ag-surface dark:bg-[#141c19] rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-ag-border transition-all duration-200 hover:shadow-md cursor-default active:scale-[0.99]">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-ag-green-50 dark:bg-[#1a2e24]">
          {showThumb ? (
            <img
              src={entry.imagePreview}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" aria-hidden>
              <Leaf size={24} color="#95D5B2" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-ag-text-1 dark:text-[#e8ece9] text-sm leading-tight truncate">
              {entry.plant.common_name}
            </p>
            <p className="text-[10px] text-ag-text-3 flex-shrink-0 font-medium">
              {formatHistoryTime(entry.timestamp, t)}
            </p>
          </div>

          <p className="text-xs italic text-ag-text-3 mt-0.5 truncate">
            {entry.plant.name}
          </p>

          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            <StatusBadge status={entry.health.status} t={t} size="small" />

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onView(entry)}
                className="text-xs text-ag-green-700 dark:text-ag-green-500 font-semibold bg-ag-green-50 dark:bg-[#1a2e24] px-3 py-1.5 rounded-full hover:bg-ag-green-100 dark:hover:bg-[#1a2e24] transition-colors active:scale-[0.97] min-h-[36px]"
              >
                {t.history_view}
              </button>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className="text-xs text-[#D94040] font-semibold bg-red-50 dark:bg-red-950/40 px-3 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors active:scale-[0.97] min-h-[36px] inline-flex items-center justify-center"
                aria-label={t.history_delete}
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
