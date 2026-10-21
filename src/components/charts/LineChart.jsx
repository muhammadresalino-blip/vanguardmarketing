import { useMemo, useState } from 'react'
import { formatDate, formatNumber } from '../../lib/format.js'

// Line/area chart ringan berbasis SVG. Menampilkan dua seri:
// total lead dan lead berkualifikasi.
export function LineChart({ data, height = 220 }) {
  const [hover, setHover] = useState(null)
  const width = 720
  const padding = { top: 16, right: 12, bottom: 26, left: 34 }

  const { points, maxValue, areaPath, linePath, qualifiedPath, ticks } = useMemo(() => {
    const max = Math.max(4, ...data.map((d) => d.total))
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom

    const toXY = (index, value) => {
      const x = padding.left + (data.length === 1 ? innerW / 2 : (index / (data.length - 1)) * innerW)
      const y = padding.top + innerH - (value / max) * innerH
      return [x, y]
    }

    const pts = data.map((d, i) => ({
      ...d,
      x: toXY(i, d.total)[0],
      y: toXY(i, d.total)[1],
      yQualified: toXY(i, d.qualified)[1],
    }))

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L${pts.at(-1)?.x ?? 0},${padding.top + innerH} L${pts[0]?.x ?? 0},${padding.top + innerH} Z`
    const qual = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.yQualified.toFixed(1)}`)
      .join(' ')

    const tickValues = [0, 0.5, 1].map((ratio) => Math.round(max * ratio))

    return { points: pts, maxValue: max, areaPath: area, linePath: line, qualifiedPath: qual, ticks: tickValues }
  }, [data, height, padding.bottom, padding.left, padding.right, padding.top])

  const labelEvery = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label="Tren jumlah lead 30 hari terakhir"
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick) => {
          const y =
            padding.top +
            (height - padding.top - padding.bottom) -
            (tick / maxValue) * (height - padding.top - padding.bottom)
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text x={4} y={y + 4} className="fill-slate-400 text-[10px]">
                {tick}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="rgba(30,58,138,0.10)" />
        <path d={linePath} fill="none" stroke="#3882F6" strokeWidth="2.5" strokeLinejoin="round" />
        <path
          d={qualifiedPath}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g key={point.date}>
            {index % labelEvery === 0 && (
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[10px]"
              >
                {new Date(point.label).getDate()}
              </text>
            )}
            {hover === index && (
              <g>
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={padding.top}
                  y2={height - padding.bottom}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                <circle cx={point.x} cy={point.y} r="4.5" fill="#3882F6" />
                <circle cx={point.x} cy={point.yQualified} r="4" fill="#10B981" />
              </g>
            )}
            <rect
              x={point.x - 6}
              y={padding.top}
              width="12"
              height={height - padding.top - padding.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
            />
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-4 rounded-full bg-primary-600" /> Total lead
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-4 rounded-full bg-accent-600" /> Lead berkualifikasi
          </span>
        </div>
        {hover !== null && points[hover] && (
          <span className="font-medium text-neutral-900">
            {formatDate(points[hover].label)}: {formatNumber(points[hover].total)} lead (
            {formatNumber(points[hover].qualified)} berkualifikasi)
          </span>
        )}
      </div>
    </div>
  )
}

export default LineChart
