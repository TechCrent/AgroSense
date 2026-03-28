import { AlertCircle, X } from 'lucide-react'

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-xl p-3 flex items-center gap-3 animate-slide-down-err">
      <AlertCircle size={16} color="#D94040" strokeWidth={2} className="flex-shrink-0" aria-hidden />
      <p className="flex-1 text-red-700 dark:text-red-300 text-sm leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-[0.97] min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Dismiss error"
      >
        <X size={16} color="#D94040" strokeWidth={2} />
      </button>
    </div>
  )
}
