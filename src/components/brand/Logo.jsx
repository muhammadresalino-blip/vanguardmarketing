import { useId } from 'react'
import { Link } from 'react-router-dom'

// Logo mark: "V" geometris — dua stroke bulat bertemu di satu titik verteks.
// Lengan kiri (indigo -> biru) di atas lengan kanan (cyan -> teal).
// SVG tajam, bisa diskalakan; ID gradasi unik per instance (useId).
export function LogoMark({ className = '', size = 36 }) {
  const uid = useId().replace(/:/g, '')
  const idL = `vl-${uid}`
  const idR = `vr-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={idL} x1="18" y1="13" x2="33" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1400E5" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id={idR} x1="46" y1="13" x2="30" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5BC8F5" />
          <stop offset="100%" stopColor="#2EE6D6" />
        </linearGradient>
      </defs>

      {/* Lengan kanan (cyan -> teal), di bawah */}
      <path d="M46 13 L31 46" stroke={`url(#${idR})`} strokeWidth="10" strokeLinecap="round" />

      {/* Lengan kiri (indigo -> biru), di atas — menutup verteks jadi satu titik rapi */}
      <path d="M18 13 L33 51" stroke={`url(#${idL})`} strokeWidth="10" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ to = '/', inverted = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={36} />
      <span className="flex flex-col leading-none">
        <span
          className={`text-[17px] font-extrabold tracking-tight ${
            inverted ? 'text-white' : 'text-neutral-900'
          }`}
        >
          Vanguard
        </span>
        <span
          className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
            inverted ? 'text-neutral-300' : 'text-neutral-500'
          }`}
        >
          Marketing
        </span>
      </span>
    </Link>
  )
}
