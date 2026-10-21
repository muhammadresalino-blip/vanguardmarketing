import { Link } from 'react-router-dom'

// Logo mark: shield "V" dengan gradasi biru -> indigo (sesuai brand style guide)
export function LogoMark({ className = '', size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vm-grad" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5B96FC" />
          <stop offset="55%" stopColor="#3882F6" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#vm-grad)" />
      <path
        d="M14 15.5h5.6l4.4 11.9 4.4-11.9H34L26.2 34h-4.4L14 15.5Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export default function Logo({ to = '/', inverted = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={36} />
      <span className="leading-tight">
        <span className={`block text-sm font-bold ${inverted ? 'text-white' : 'text-neutral-900'}`}>
          Vanguard
        </span>
        <span
          className={`block text-[11px] font-medium tracking-wide ${
            inverted ? 'text-neutral-200' : 'text-accent-600'
          }`}
        >
          MARKETING
        </span>
      </span>
    </Link>
  )
}
