export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
      <span className="text-red-700 text-sm">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-3 text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  )
}
