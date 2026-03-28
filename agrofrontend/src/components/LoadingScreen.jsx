import { useState, useEffect } from 'react'

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
    <div className="fixed inset-0 z-50 bg-[#F8FFF9] flex flex-col items-center justify-center min-h-screen text-center px-4">

      {/* Animated leaf */}
      <div className="animate-pulse">
        <span className="text-7xl">🌿</span>
      </div>

      {/* Spinner ring */}
      <div className="w-12 h-12 rounded-full mt-6 border-4 border-[#D8E8DF] border-t-[#2D6A4F] animate-spin" />

      {/* Status text — keyed so React remounts on step change */}
      <p
        key={displayStep}
        className="animate-pulse text-lg font-medium text-[#2D6A4F] mt-6"
      >
        {steps[displayStep]}
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i === displayStep
                ? 'bg-[#2D6A4F] w-2.5 h-2.5'
                : 'bg-[#D8E8DF] w-2 h-2'
            }`}
          />
        ))}
      </div>

      {/* Subtext */}
      <p className="text-xs text-[#555F61] mt-3">This usually takes under 8 seconds</p>
    </div>
  )
}
