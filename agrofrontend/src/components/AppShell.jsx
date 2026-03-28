import SideNav from './SideNav.jsx'
import RightPanel from './RightPanel.jsx'

export default function AppShell({ children, appColumnRef, t }) {
  return (
    <div className="relative min-h-screen w-full">
      <div
        className="pointer-events-none hidden md:block fixed inset-0 -z-10 dark:md:opacity-80"
        style={{
          backgroundColor: '#E8F0EB',
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(82,183,136,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(45,106,79,0.06) 0%, transparent 40%)
          `,
        }}
        aria-hidden
      />
      <div className="flex min-h-screen w-full flex-col md:flex-row md:bg-[#F0F5F2] md:dark:bg-[#0a0f0d]">
        <SideNav t={t} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row md:justify-center md:items-stretch">
          <div
            ref={appColumnRef}
            className="app-column w-full min-h-screen shrink-0 bg-ag-bg dark:bg-[#0c1210] sm:mx-auto sm:max-w-md md:mx-0 md:h-screen md:min-h-0 md:w-[390px] md:max-w-none md:overflow-y-auto md:shadow-[0_0_60px_rgba(0,0,0,0.15)] md:dark:shadow-[0_0_60px_rgba(0,0,0,0.45)]"
          >
            {children}
          </div>
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
