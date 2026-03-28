const CONFIG = {
  healthy:  { bg: 'bg-[#52B788]', key: 'status_healthy' },
  at_risk:  { bg: 'bg-[#F4A261]', key: 'status_at_risk' },
  infected: { bg: 'bg-[#E63946]', key: 'status_infected' },
}

export default function StatusBadge({ status, t }) {
  const { bg, key } = CONFIG[status] ?? CONFIG.healthy
  return (
    <span className={`${bg} text-white inline-block rounded-full px-6 py-2 text-base font-bold tracking-wide`}>
      {t[key]}
    </span>
  )
}
