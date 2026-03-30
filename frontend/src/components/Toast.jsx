import { CheckCircle2 } from 'lucide-react'

export default function Toast({ message, visible }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
    >
      <div
        className={`
          bg-[#0F1F17]/90 dark:bg-[#e8ece9]/95 backdrop-blur-xl text-white dark:text-ag-text-1 text-sm
          font-medium px-5 py-2.5 rounded-full
          shadow-[0_4px_20px_rgba(0,0,0,0.3)] dark:shadow-lg
          flex items-center gap-2
          transition-all duration-300
          ${visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-3 pointer-events-none'
          }
        `}
      >
        <CheckCircle2 size={18} className="text-ag-green-500 dark:text-ag-green-700 flex-shrink-0" strokeWidth={2} />
        <span>{message}</span>
      </div>
    </div>
  )
}
