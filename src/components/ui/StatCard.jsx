import { formatPercent } from '../../lib/format.js'

export function StatCard({ label, value, hint, trend, trendLabel, icon, tone = 'navy' }) {
  const toneRing = {
    navy: 'bg-primary-50 text-primary-600',
    teal: 'bg-accent-50 text-accent-600',
    accent: 'bg-accent-50 text-accent-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    sky: 'bg-sky-50 text-sky-700',
  }[tone]

  const isPositive = typeof trend === 'number' && trend >= 0
  const isNeutral = trend === undefined || trend === null

  return (
    <div className="card-pad">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${toneRing}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {!isNeutral && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {isPositive ? '▲' : '▼'} {formatPercent(Math.abs(trend))}
          </span>
        )}
        {(hint || trendLabel) && <span className="text-slate-500">{trendLabel ?? hint}</span>}
      </div>
    </div>
  )
}

export default StatCard
