import { formatNumber, formatPercent } from '../../lib/format.js'
import { LEAD_STATUSES } from '../../lib/constants.js'

const LABEL = LEAD_STATUSES.reduce((acc, s) => {
  acc[s.value] = s.label
  return acc
}, {})

// Funnel kumulatif: berapa lead yang berhasil melewati tiap tahap.
export function FunnelChart({ stages }) {
  const max = Math.max(1, ...stages.map((s) => s.reached))

  return (
    <ol className="space-y-2">
      {stages.map((stage, index) => {
        const width = Math.max(6, (stage.reached / max) * 100)
        const tones = ['bg-navy-700', 'bg-navy-500', 'bg-teal-500', 'bg-accent-500', 'bg-emerald-500']
        return (
          <li key={stage.status} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-navy-900">
                {index + 1}. {LABEL[stage.status] ?? stage.status}
              </span>
              <span className="flex items-center gap-3 text-slate-600">
                <span className="font-semibold text-navy-900">{formatNumber(stage.reached)}</span>
                <span className="text-xs">{formatPercent(stage.conversionFromStart)} dari total</span>
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${tones[index % tones.length]}`}
                style={{ width: `${width}%` }}
              />
            </div>
            {index > 0 && (
              <p className="mt-1.5 text-xs text-slate-500">
                Konversi dari tahap sebelumnya: {formatPercent(stage.conversionFromPrevious)}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default FunnelChart
