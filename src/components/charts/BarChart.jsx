import { formatNumber } from '../../lib/format.js'

// Bar chart horizontal ringan (SVG murni, tanpa library chart).
// Dipakai untuk "lead per sumber kanal".
export function BarChart({ data, valueKey = 'total', labelKey = 'label', suffix = '', tone = 'navy' }) {
  const max = Math.max(1, ...data.map((item) => item[valueKey]))
  const tones = {
    navy: 'bg-primary-600',
    teal: 'bg-accent-500',
    accent: 'bg-accent-500',
    sky: 'bg-sky-500',
  }

  return (
    <ul className="space-y-3">
      {data.map((item) => {
        const width = Math.max(2, (item[valueKey] / max) * 100)
        return (
          <li key={item[labelKey]}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-600">{item[labelKey]}</span>
              <span className="shrink-0 font-semibold text-neutral-900">
                {formatNumber(item[valueKey])}
                {suffix}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${tones[tone]}`}
                style={{ width: `${width}%` }}
                role="presentation"
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default BarChart
