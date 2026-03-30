const configs = {
  healthy: {
    bg: 'bg-[#EDFAF3] dark:bg-[#0f2418]',
    text: 'text-[#2D9E6B]',
    border: 'border-[#A8E6C3] dark:border-[#2a5c40]',
    dot: 'bg-[#2D9E6B]',
    glow: 'shadow-[0_0_12px_rgba(45,158,107,0.25)]',
  },
  at_risk: {
    bg: 'bg-[#FFF5EB] dark:bg-[#2a2010]',
    text: 'text-[#E07B2A]',
    border: 'border-[#FFDBB5] dark:border-[#6b4a2a]',
    dot: 'bg-[#E07B2A]',
    glow: 'shadow-[0_0_12px_rgba(224,123,42,0.25)]',
  },
  infected: {
    bg: 'bg-[#FEF0F0] dark:bg-[#2a1515]',
    text: 'text-[#D94040]',
    border: 'border-[#FBCACA] dark:border-[#6b3030]',
    dot: 'bg-[#D94040]',
    glow: 'shadow-[0_0_12px_rgba(217,64,64,0.25)]',
  },
}

export default function StatusBadge({ status, t, size }) {
  const key = `status_${status}`
  const statusText = t[key] ?? status
  const c = configs[status] ?? configs.healthy

  if (size === 'small') {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-semibold text-[10px]
          ${c.bg} ${c.text} ${c.border} ${c.glow}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
        {statusText}
      </div>
    )
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm
        ${c.bg} ${c.text} ${c.border} ${c.glow}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
      {statusText}
    </div>
  )
}
