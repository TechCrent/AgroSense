import { useLocation } from 'react-router-dom'
import {
  Leaf,
  Microscope,
  Lightbulb,
  Globe,
  History as HistoryIcon,
  Clock,
  Check,
} from 'lucide-react'

export default function RightPanel() {
  const { pathname } = useLocation()

  const wrap = (content) => (
    <div
      className="hidden h-screen min-w-0 flex-1 flex-col justify-center overflow-y-auto px-10 py-16 md:flex lg:px-16"
    >
      <div className="mx-auto w-full max-w-xl opacity-0 animate-fade-up [animation-fill-mode:forwards]">
        {content}
      </div>
    </div>
  )

  if (pathname === '/result') {
    return wrap(
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#8FA89D] dark:text-[#9ca8a3]">
            Your Diagnosis
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
            Here&apos;s what we found.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-base">
            Review your plant&apos;s health status and follow the recommended steps below.
          </p>
        </div>
        <div className="rounded-3xl bg-ag-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:bg-[#141c19] dark:shadow-none">
          <p className="mb-4 text-sm font-bold text-[#0F1F17] dark:text-[#e8ece9]">
            Pro Tips
          </p>
          <div className="space-y-3">
            {[
              'Take photos in natural daylight for best results',
              'Focus on affected leaves or stems',
              'Scan weekly to monitor plant recovery',
              'Share results with your local agronomist',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FFF4] dark:bg-[#1a2e24]">
                  <Check size={10} color="#2D6A4F" strokeWidth={3} aria-hidden />
                </div>
                <p className="text-xs leading-relaxed text-[#4A5E54] dark:text-[#b8c4be] lg:text-sm">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (pathname === '/history') {
    return wrap(
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#8FA89D] dark:text-[#9ca8a3]">
            Scan History
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
            Track your plants
            <span className="text-[#2D6A4F]"> over time.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-base">
            Your last 20 scans are saved automatically. Tap any entry to review the full diagnosis.
          </p>
        </div>
        <div className="space-y-3">
          {[
            {
              icon: <HistoryIcon size={18} color="#2D6A4F" strokeWidth={1.75} />,
              title: 'Auto-saved',
              body: 'Every scan is saved locally on your device',
            },
            {
              icon: <Clock size={18} color="#2D6A4F" strokeWidth={1.75} />,
              title: 'Up to 20 scans',
              body: 'Oldest entries are removed automatically',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex gap-3 rounded-2xl bg-ag-surface p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-[#141c19]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0FFF4] dark:bg-[#1a2e24]">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F1F17] dark:text-[#e8ece9]">{f.title}</p>
                <p className="mt-0.5 text-xs text-[#8FA89D] dark:text-[#9ca8a3]">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pathname === '/settings') {
    return wrap(
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#8FA89D] dark:text-[#9ca8a3]">
            Preferences
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
            Make it
            <span className="text-[#2D6A4F]"> yours.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-base">
            Set your language and preferences. Settings are saved automatically to your device.
          </p>
        </div>
        <div className="rounded-3xl bg-ag-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:bg-[#141c19]">
          <p className="mb-1 text-sm font-bold text-[#0F1F17] dark:text-[#e8ece9]">Supported Languages</p>
          <p className="mb-4 text-xs text-[#8FA89D] dark:text-[#9ca8a3]">UI and AI diagnosis translation</p>
          <div className="grid grid-cols-2 gap-2">
            {['English', 'Zulu', 'Xhosa', 'Swahili', 'Sesotho', 'Afrikaans'].map((lang) => (
              <div
                key={lang}
                className="flex items-center gap-2 rounded-xl bg-[#F7FAF8] px-3 py-2 dark:bg-[#1a2320]"
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52B788]" />
                <span className="text-xs font-medium text-[#0F1F17] dark:text-[#e8ece9]">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* Home and selection (/) */
  return wrap(
    <div className="space-y-8">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#2D6A4F] dark:bg-[#1a2e24] dark:text-ag-green-400">
          <Leaf size={12} color="#2D6A4F" strokeWidth={2} aria-hidden />
          AI-Powered Diagnosis
        </div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
          Identify plant diseases
          <span className="text-[#2D6A4F]"> instantly.</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-lg">
          Upload a photo of any plant and get an AI-powered health diagnosis in under 8 seconds.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '500K+', label: 'Plant samples' },
          { value: '98.4%', label: 'Accuracy' },
          { value: '10+', label: 'Languages' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-ag-surface p-4 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-[#141c19]"
          >
            <p className="text-2xl font-bold text-[#2D6A4F] lg:text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-[#8FA89D] dark:text-[#9ca8a3] lg:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[
          {
            icon: <Microscope size={18} color="#2D6A4F" strokeWidth={1.75} />,
            title: 'Laboratory Precision',
            body: 'Trained on 500,000+ verified pathological samples',
          },
          {
            icon: <Lightbulb size={18} color="#2D6A4F" strokeWidth={1.75} />,
            title: 'Expert Insights',
            body: 'Organic treatment and prevention recommendations',
          },
          {
            icon: <Globe size={18} color="#2D6A4F" strokeWidth={1.75} />,
            title: 'African Languages',
            body: 'Diagnosis in Zulu, Xhosa, Swahili and more',
          },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0FFF4] dark:bg-[#1a2e24]">
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F1F17] dark:text-[#e8ece9]">{f.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#8FA89D] dark:text-[#9ca8a3] lg:text-sm">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
