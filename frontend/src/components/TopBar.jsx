import { Leaf } from 'lucide-react'

export default function TopBar({
  t,
  title,
  subtitle,
  rightElement,
  right,
  showLogo = true,
}) {
  const actions = rightElement ?? right
  const desktopTitle = title ?? t?.app_name

  return (
    <header className="sticky top-0 z-30 border-b border-ag-border bg-white/90 backdrop-blur-xl dark:border-[#2a3d34] dark:bg-[#141c19]/90">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 py-4 md:max-w-none">
        {showLogo ? (
          <>
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ag-green-700 to-ag-green-500 shadow-sm">
                <Leaf size={16} color="#FFFFFF" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-none text-ag-text-1 dark:text-[#e8ece9]">
                  {t?.app_name ?? 'AgroSense'}
                </h1>
                {subtitle ? (
                  <p className="mt-0.5 truncate text-[10px] font-medium text-ag-text-3 dark:text-[#9ca8a3]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
            <h1 className="hidden min-w-0 flex-1 truncate text-xl font-bold leading-tight text-ag-text-1 dark:text-[#e8ece9] md:block">
              {desktopTitle}
            </h1>
          </>
        ) : (
          <h1 className="min-w-0 flex-1 truncate text-xl font-bold leading-tight text-ag-text-1 dark:text-[#e8ece9]">
            {title}
          </h1>
        )}
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  )
}
