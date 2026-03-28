export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`
        bg-gradient-to-r from-[#E8F0EB] via-[#F5FAF6] to-[#E8F0EB]
        bg-[length:200%_100%] animate-shimmer rounded-xl
        ${className}
      `}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-ag-surface dark:bg-[#141c19] rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
      <div className="flex gap-3 items-center">
        <SkeletonBlock className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <SkeletonBlock className="h-4 w-3/4 max-w-full" />
          <SkeletonBlock className="h-3 w-1/2 max-w-full" />
          <SkeletonBlock className="h-5 w-16 rounded-full max-w-[4rem]" />
        </div>
      </div>
    </div>
  )
}
