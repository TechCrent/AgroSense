import { useNavigate, useLocation } from 'react-router-dom'
import { Scan, History, Settings } from 'lucide-react'

export default function BottomNav({ t }) {
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
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="bg-white/90 dark:bg-[#141c19]/90 backdrop-blur-xl border-t border-ag-border dark:border-[#2a3d34] shadow-[0_-2px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)] px-2 py-2">
        <div className="flex justify-around">
          {tabs.map(({ path, label, Icon }) => {
            const active = isActive(path)
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className={`
                  flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 flex-1 min-h-[48px]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-ag-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141c19]
                  active:scale-[0.97]
                  ${active
                    ? 'bg-ag-green-50 dark:bg-[#1a2e24] text-ag-green-700 dark:text-ag-green-500'
                    : 'text-ag-text-3 dark:text-[#9ca8a3]'
                  }
                `}
              >
                <span
                  className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}
                  aria-hidden
                >
                  <Icon size={24} strokeWidth={1.75} className="text-current" />
                </span>
                <span
                  className={`
                    text-[10px] font-semibold uppercase tracking-widest
                    ${active ? 'text-ag-green-700 dark:text-ag-green-500' : 'text-ag-text-3 dark:text-[#9ca8a3]'}
                  `}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
