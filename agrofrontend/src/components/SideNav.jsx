import { useNavigate, useLocation } from 'react-router-dom'
import { Scan, History, Settings, Leaf } from 'lucide-react'

export default function SideNav({ t }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const tabs = [
    { path: '/', label: t.nav_scan, Icon: Scan },
    { path: '/history', label: t.nav_history, Icon: History },
    { path: '/settings', label: t.nav_settings, Icon: Settings },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/result'
    }
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav
      className="hidden h-screen w-[72px] shrink-0 flex-col items-center gap-1 border-r border-ag-border bg-ag-surface px-3 py-6 dark:border-[#2a3d34] dark:bg-[#141c19] md:flex lg:w-[220px] lg:items-start lg:px-4"
      aria-label={t.nav_aria_main}
    >
      <div className="mb-8 flex items-center gap-3 px-2 lg:px-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#52B788] shadow-sm">
          <Leaf size={18} color="#FFFFFF" strokeWidth={1.75} aria-hidden />
        </div>
        <span className="hidden font-bold text-base text-[#0F1F17] dark:text-[#e8ece9] lg:block">
          {t.app_name}
        </span>
      </div>

      {tabs.map(({ path, label, Icon }) => {
        const active = isActive(path)
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`
              flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ag-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141c19]
              ${active
                ? 'bg-[#F0FFF4] text-[#2D6A4F] dark:bg-[#1a2e24] dark:text-ag-green-500'
                : 'text-[#8FA89D] hover:bg-[#F7FAF8] hover:text-[#4A5E54] dark:text-[#9ca8a3] dark:hover:bg-[#1a2320] dark:hover:text-[#c8d4cf]'
              }
            `}
          >
            <span className="flex shrink-0 justify-center lg:w-auto">
              <Icon size={20} strokeWidth={1.75} className="text-current" aria-hidden />
            </span>
            <span
              className={`
                hidden text-sm font-semibold lg:block
                ${active ? 'text-[#2D6A4F] dark:text-ag-green-500' : 'text-[#4A5E54] dark:text-[#c8d4cf]'}
              `}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
