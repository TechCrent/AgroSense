export default function ConfidenceBar({ confidence, label }) {
  const pct = Math.round((confidence ?? 0) * 100)
  const bar = confidence > 0.8
    ? 'linear-gradient(90deg, #52B788, #2D9E6B)'
    : confidence > 0.5
      ? 'linear-gradient(90deg, #F4A261, #E07B2A)'
      : 'linear-gradient(90deg, #F08080, #D94040)'

  return (
    <div className="w-full min-w-0">
      {label ? (
        <div className="flex justify-between mb-1.5 gap-2">
          <span className="text-xs text-ag-text-2 dark:text-[#9ca8a3] font-medium truncate">
            {label}
          </span>
          <span className="text-xs font-bold text-ag-text-1 dark:text-[#e8ece9] flex-shrink-0">
            {pct}%
          </span>
        </div>
      ) : (
        <div className="flex justify-end mb-1.5">
          <span className="text-xs font-bold text-ag-text-1 dark:text-[#e8ece9]">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 bg-ag-border dark:bg-[#2a3d34] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: bar }}
        />
      </div>
    </div>
  )
}
