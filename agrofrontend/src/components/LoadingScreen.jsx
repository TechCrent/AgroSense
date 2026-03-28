import { useState, useEffect } from 'react'
import { Leaf } from 'lucide-react'
import { SkeletonCard } from './SkeletonCard.jsx'

export default function LoadingScreen({ t, loadingStep }) {
  const [displayStep, setDisplayStep] = useState(loadingStep ?? 0)

  useEffect(() => {
    setDisplayStep(loadingStep ?? 0)
  }, [loadingStep])

  useEffect(() => {
    if (displayStep >= 2) return
    const timer = setTimeout(() => {
      setDisplayStep((s) => Math.min(s + 1, 2))
    }, 2500)
    return () => clearTimeout(timer)
  }, [displayStep])

  const steps = [t.loading_identifying, t.loading_checking, t.loading_generating]

  return (
    <div className="fixed inset-0 z-50 bg-ag-bg dark:bg-[#0c1210] flex flex-col items-center justify-start pt-8 pb-6 px-5 overflow-y-auto animate-fade-in-page">
      <div className="relative w-32 h-32 mb-6 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-4 border-ag-green-100 dark:border-[#1a2e24] border-t-ag-green-700 animate-spin" />
        <div className="absolute inset-3 rounded-full border-2 border-ag-green-500/40 animate-ping" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf size={40} color="#2D6A4F" strokeWidth={1.5} className="animate-heartbeat" />
        </div>
      </div>

      <div className="h-8 flex items-center justify-center mb-3">
        <p
          key={displayStep}
          className="text-lg font-semibold text-ag-text-1 dark:text-[#e8ece9] animate-fade-up text-center px-2"
          style={{ animationFillMode: 'forwards' }}
        >
          {steps[displayStep]}
        </p>
      </div>

      <div className="w-48 h-1 bg-ag-border dark:bg-[#2a3d34] rounded-full overflow-hidden mt-2">
        <div className="h-full bg-gradient-to-r from-ag-green-500 to-ag-green-700 rounded-full animate-progress-fill" />
      </div>

      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`
              rounded-full transition-all duration-500
              ${i === displayStep
                ? 'w-6 h-2 bg-ag-green-700 dark:bg-ag-green-500'
                : i < displayStep
                  ? 'w-2 h-2 bg-ag-green-500'
                  : 'w-2 h-2 bg-[#D8E8DF] dark:bg-[#3d4f47]'
              }
            `}
          />
        ))}
      </div>

      <p className="text-xs text-ag-text-3 mt-6 font-medium">
        {t.loading_usually}
      </p>

      <div className="w-full max-w-md mt-8 space-y-4 pb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
