import { formatNumber, formatPercent } from '../../lib/format.js'

const COLORS = ['#3882F6', '#10B981', '#6366F1', '#0ea5e9', '#7c3aed', '#10b981', '#ef4444', '#64748b']

// Donut chart SVG untuk komposisi (mis. lead per kanal atau per status).
export function DonutChart({ data, labelKey = 'label', valueKey = 'value', centerLabel = 'Total' }) {
  const total = data.reduce((sum, item) => sum + item[valueKey], 0)
  const radius = 60
  const stroke = 22
  const circumference = 2 * Math.PI * radius

  const segments = data.reduce(
    (acc, item, index) => {
      const fraction = total ? item[valueKey] / total : 0
      const previousOffset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0
      acc.push({
        ...item,
        color: COLORS[index % COLORS.length],
        dash: fraction * circumference,
        offset: previousOffset,
        fraction,
      })
      return acc
    },
    [],
  )

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0" role="img" aria-label="Komposisi lead">
        <g transform="rotate(-90 80 80)">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {segments.map((segment) => (
            <circle
              key={segment[labelKey]}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={stroke}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text x="80" y="74" textAnchor="middle" className="fill-slate-400 text-[10px]">
          {centerLabel}
        </text>
        <text x="80" y="92" textAnchor="middle" className="fill-neutral-900 text-[16px] font-bold">
          {formatNumber(total)}
        </text>
      </svg>

      <ul className="w-full space-y-2 text-sm">
        {segments.map((segment) => (
          <li key={segment[labelKey]} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: segment.color }} />
              <span className="truncate text-slate-600">{segment[labelKey]}</span>
            </span>
            <span className="shrink-0 font-semibold text-neutral-900">
              {formatNumber(segment[valueKey])}{' '}
              <span className="font-normal text-slate-400">({formatPercent(segment.fraction * 100, 0)})</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DonutChart
