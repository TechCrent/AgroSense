import { useEffect, useRef } from 'react'
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
import { useLocale } from '../hooks/useLocale.js'
import { langLabel } from '../i18n/langCodes.js'

const RIGHT_PANEL_LANG_CODES = ['en', 'zu', 'xh', 'swh', 'sot', 'afr']

export default function RightPanel() {
  const { pathname } = useLocation()
  const { t } = useLocale()
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  const wrap = (content) => (
    <div
      ref={scrollRef}
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
            {t.rightpanel_result_kicker}
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
            {t.rightpanel_result_title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-base">
            {t.rightpanel_result_desc}
          </p>
        </div>
        <div className="rounded-3xl bg-ag-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:bg-[#141c19] dark:shadow-none">
          <p className="mb-4 text-sm font-bold text-[#0F1F17] dark:text-[#e8ece9]">
            {t.rightpanel_pro_tips}
          </p>
          <div className="space-y-3">
            {[t.rightpanel_tip_1, t.rightpanel_tip_2, t.rightpanel_tip_3, t.rightpanel_tip_4].map((tip, i) => (
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
            {t.rightpanel_history_kicker}
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
            {t.rightpanel_history_title}
            <span className="text-[#2D6A4F]">{t.rightpanel_history_title_accent}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-base">
            {t.rightpanel_history_desc}
          </p>
        </div>
        <div className="space-y-3">
          {[
            {
              icon: <HistoryIcon size={18} color="#2D6A4F" strokeWidth={1.75} />,
              title: t.rightpanel_history_auto_title,
              body: t.rightpanel_history_auto_body,
            },
            {
              icon: <Clock size={18} color="#2D6A4F" strokeWidth={1.75} />,
              title: t.rightpanel_history_limit_title,
              body: t.rightpanel_history_limit_body,
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
            {t.settings_section_preferences}
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
            {t.rightpanel_settings_title}
            <span className="text-[#2D6A4F]">{t.rightpanel_settings_title_accent}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-base">
            {t.rightpanel_settings_desc}
          </p>
        </div>
        <div className="rounded-3xl bg-ag-surface p-6 shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:bg-[#141c19]">
          <p className="mb-1 text-sm font-bold text-[#0F1F17] dark:text-[#e8ece9]">{t.rightpanel_supported_langs_title}</p>
          <p className="mb-4 text-xs text-[#8FA89D] dark:text-[#9ca8a3]">{t.rightpanel_supported_langs_sub}</p>
          <div className="grid grid-cols-2 gap-2">
            {RIGHT_PANEL_LANG_CODES.map((code) => (
              <div
                key={code}
                className="flex items-center gap-2 rounded-xl bg-[#F7FAF8] px-3 py-2 dark:bg-[#1a2320]"
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#52B788]" />
                <span className="text-xs font-medium text-[#0F1F17] dark:text-[#e8ece9]">
                  {langLabel(t, code)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return wrap(
    <div className="space-y-8">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#2D6A4F] dark:bg-[#1a2e24] dark:text-ag-green-400">
          <Leaf size={12} color="#2D6A4F" strokeWidth={2} aria-hidden />
          {t.rightpanel_badge}
        </div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0F1F17] dark:text-[#e8ece9] lg:text-4xl">
          {t.rightpanel_home_title}
          <span className="text-[#2D6A4F]">{t.rightpanel_home_title_accent}</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#4A5E54] dark:text-[#9ca8a3] lg:text-lg">
          {t.rightpanel_home_desc}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '500K+', label: t.rightpanel_stat_plant_samples },
          { value: '98.4%', label: t.rightpanel_stat_accuracy },
          { value: '10+', label: t.rightpanel_stat_languages },
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
            title: t.lab_precision_title,
            body: t.lab_precision_body,
          },
          {
            icon: <Lightbulb size={18} color="#2D6A4F" strokeWidth={1.75} />,
            title: t.expert_insights_title,
            body: t.expert_insights_body,
          },
          {
            icon: <Globe size={18} color="#2D6A4F" strokeWidth={1.75} />,
            title: t.rightpanel_feature_langs_title,
            body: t.rightpanel_feature_langs_body,
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
