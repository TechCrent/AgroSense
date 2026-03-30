import { Navigate } from 'react-router-dom'
import {
  Bug,
  AlertTriangle,
  HeartPulse,
  Leaf,
  Check,
  Shield,
  Stethoscope,
  ScanLine,
  Download,
} from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import ConfidenceBar from '../components/ConfidenceBar.jsx'
import PrimaryButton from '../components/PrimaryButton.jsx'
import TranslateBar from '../components/TranslateBar.jsx'
import { interpolate } from '../i18n/interpolate.js'

export default function Result({
  t,
  lang,
  result,
  imagePreview,
  resetAll,
  translating,
  translateResult,
}) {
  if (!result) return <Navigate to="/" replace />

  const { plant, health, diagnosis } = result
  const diagnosisLang = diagnosis?.language ?? lang ?? 'en'
  const status = health.status
  const isInfected = status === 'infected'
  const steps = diagnosis.steps ?? []

  const handleSave = () => {
    const hStatus = health.status
    const infected = hStatus === 'infected'
    const statusLabel =
      hStatus === 'infected' ? t.status_infected : hStatus === 'at_risk' ? t.status_at_risk : t.status_healthy

    const lines = [
      t.result_export_header,
      '',
      interpolate(t.result_export_plant_line, {
        common: plant.common_name ?? '',
        scientific: plant.name ?? '',
      }),
      interpolate(t.result_export_match_line, { pct: String(Math.round(plant.confidence * 100)) }),
      interpolate(t.result_export_health_line, { status: statusLabel }),
      '',
      infected ? interpolate(t.result_export_disease_line, { name: health.disease_name ?? '—' }) : '',
      infected ? interpolate(t.result_export_type_line, { type: health.disease_type ?? '—' }) : '',
      infected
        ? interpolate(t.result_export_detection_line, {
            pct: String(Math.round((health.confidence ?? 0) * 100)),
          })
        : '',
      '',
      t.result_export_summary_title,
      diagnosis.summary ?? '',
      '',
      infected ? t.result_export_treatment_title : t.result_export_prevention_title,
      ...steps.map((s, i) => (infected ? `${i + 1}. ${s}` : `• ${s}`)),
      '',
      interpolate(t.result_export_scanned_line, { datetime: new Date().toLocaleString() }),
      t.result_export_footer,
    ].filter((line) => line !== '')

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safe = (plant.common_name ?? 'plant').toLowerCase().replace(/\s+/g, '-')
    a.download = `agrosense-${safe}-diagnosis.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8] pb-28">
      <TopBar t={t} showLogo title={t.result_diagnosis_title} />

      {translateResult ? (
        <div className="px-5 pt-3">
          <TranslateBar
            t={t}
            translating={translating}
            translateResult={translateResult}
            diagnosisLang={diagnosisLang}
          />
        </div>
      ) : null}

      {translating ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 gap-4">
          <div
            className="w-10 h-10 rounded-full border-[3px] border-[#D8E8DF] border-t-[#2D6A4F] animate-spin"
            aria-hidden
          />
          <p className="text-sm text-[#4A5E54] text-center max-w-xs">{t.result_page_loading}</p>
        </div>
      ) : (
        <>
      <div className="flex gap-2 px-5 pt-3 pb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-1 bg-[#2D6A4F] rounded-full" />
        ))}
      </div>

      {/* Plant identity card */}
      <div className="mx-5 mt-3">
        <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
          <div className="relative h-52 bg-[#F0FFF4]">
            {imagePreview ? (
              <img src={imagePreview} alt={plant.common_name ?? ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf size={48} color="#95D5B2" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">
                {t.result_plant_identity}
              </p>
              <p className="text-white font-bold text-2xl leading-tight drop-shadow-sm">
                {plant.common_name}
              </p>
              <p className="text-white/65 text-xs italic mt-0.5">{plant.name}</p>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-[#F0F0F0]">
            <ConfidenceBar confidence={plant.confidence} label={t.confidence_label} />
          </div>

          <div className="px-5 py-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#8FA89D] uppercase tracking-widest">
              {t.result_health_status}
            </p>
            <StatusBadge status={status} t={t} />
          </div>
        </div>
      </div>

      {/* Status banner */}
      {status === 'infected' && (
        <div className="mx-5 mt-3">
          <div className="bg-[#FEF0F0] border border-[#FBCACA] rounded-3xl p-5 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
              <Bug size={20} color="#D94040" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#D94040] text-base leading-tight">{t.result_infected_msg}</p>
              <p className="text-sm text-[#D94040]/70 mt-1 leading-relaxed">{t.result_infected_sub}</p>
            </div>
          </div>
        </div>
      )}

      {status === 'at_risk' && (
        <div className="mx-5 mt-3">
          <div className="bg-[#FFF5EB] border border-[#FFDBB5] rounded-3xl p-5 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-[#FEE9D1] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} color="#E07B2A" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#E07B2A] text-base leading-tight">{t.result_at_risk_msg}</p>
              <p className="text-sm text-[#E07B2A]/70 mt-1 leading-relaxed">{t.result_at_risk_sub}</p>
            </div>
          </div>
        </div>
      )}

      {status === 'healthy' && (
        <div className="mx-5 mt-3">
          <div className="bg-[#EDFAF3] border border-[#A8E6C3] rounded-3xl p-5 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-2xl bg-[#D1F5E3] flex items-center justify-center flex-shrink-0">
              <HeartPulse size={20} color="#2D9E6B" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#2D9E6B] text-base leading-tight">{t.result_healthy_msg}</p>
              <p className="text-sm text-[#2D9E6B]/70 mt-1 leading-relaxed">{t.result_healthy_sub}</p>
            </div>
          </div>
        </div>
      )}

      {/* Disease detail (infected only) */}
      {isInfected && (
        <div className="mx-5 mt-3">
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8FA89D] mb-4">
              {t.result_disease_name}
            </p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-[#0F1F17] leading-tight">
                  {health.disease_name ?? '—'}
                </p>
              </div>
              {health.disease_type ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-red-50 text-[#D94040] border border-red-100 text-xs font-semibold px-3 py-1.5 rounded-full mt-1">
                  <Bug size={10} color="#D94040" />
                  {health.disease_type}
                </span>
              ) : null}
            </div>
            <div className="h-px bg-[#F0F0F0] my-4" />
            <p className="text-xs font-semibold text-[#8FA89D] uppercase tracking-widest mb-2">
              {t.result_disease_type}
            </p>
            <ConfidenceBar confidence={health.confidence} label={t.confidence_label} />
          </div>
        </div>
      )}

      {/* Description / summary card */}
      <div className="mx-5 mt-3">
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                status === 'infected' ? 'bg-red-50' : 'bg-[#F0FFF4]'
              }`}
            >
              {status === 'infected' ? (
                <Bug size={14} color="#D94040" />
              ) : (
                <Leaf size={14} color="#2D6A4F" />
              )}
            </div>
            <p className="text-sm font-bold text-[#0F1F17]">
              {status === 'infected' ? t.result_disease_description : t.result_health_status}
            </p>
          </div>
          <p className="text-sm text-[#4A5E54] leading-relaxed">{diagnosis.summary}</p>
        </div>
      </div>

      {/* Treatment steps (infected) */}
      {isInfected && (
        <div className="mx-5 mt-3">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] flex items-center justify-center">
              <Stethoscope size={16} color="#FFFFFF" />
            </div>
            <div>
              <p className="font-bold text-[#0F1F17] text-base">{t.result_treatment_title}</p>
              <p className="text-xs text-[#8FA89D] mt-0.5">{t.result_treatment_sub}</p>
            </div>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 flex gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#3A8C66] flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px flex-1 min-h-[16px] bg-[#E2EDE7] mt-1" />
                  )}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8FA89D] mb-1">
                    {t.result_step_label} {index + 1}
                  </p>
                  <p className="text-sm text-[#0F1F17] leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preventive measures (healthy / at_risk) */}
      {!isInfected && (
        <div className="mx-5 mt-3">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                status === 'at_risk' ? 'bg-[#E07B2A]' : 'bg-[#2D9E6B]'
              }`}
            >
              <Shield size={16} color="#FFFFFF" />
            </div>
            <div>
              <p className="font-bold text-[#0F1F17] text-base">{t.result_prevention_title}</p>
              <p className="text-xs text-[#8FA89D] mt-0.5">{t.result_prevention_sub}</p>
            </div>
          </div>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 flex gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                    status === 'at_risk' ? 'bg-[#FFF5EB]' : 'bg-[#EDFAF3]'
                  }`}
                >
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    color={status === 'at_risk' ? '#E07B2A' : '#2D9E6B'}
                  />
                </div>
                <div className="flex-1 pt-0.5 min-w-0">
                  <p className="text-sm text-[#0F1F17] leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mx-5 mt-6 mb-8 space-y-3">
        <PrimaryButton
          label={t.result_scan_again}
          icon={<ScanLine size={18} color="#FFFFFF" />}
          onClick={resetAll}
        />
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-semibold text-base border-2 border-[#2D6A4F] text-[#2D6A4F] bg-transparent flex items-center justify-center gap-2 hover:bg-[#F0FFF4] transition-all duration-200 active:scale-[0.98]"
        >
          <Download size={18} color="#2D6A4F" />
          {t.result_share}
        </button>
      </div>
        </>
      )}
    </div>
  )
}
