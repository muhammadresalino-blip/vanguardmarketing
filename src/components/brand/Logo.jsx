import { Link } from 'react-router-dom'

export function Logo({ className = '', to = '/', inverted = false }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-black text-white">
        V
      </span>
      <span className="leading-tight">
        <span className={`block text-sm font-bold ${inverted ? 'text-white' : 'text-neutral-900'}`}>
          Vanguard
        </span>
        <span className={`block text-[11px] font-medium tracking-wide ${inverted ? 'text-neutral-200' : 'text-accent-600'}`}>
          MARKETING
        </span>
      </span>
    </Link>
  )
}

export default Logo
