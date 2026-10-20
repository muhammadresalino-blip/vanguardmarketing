import { initials } from '../../lib/format.js'

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({ name, size = 'md', tone = 'navy', className = '' }) {
  const tones = {
    navy: 'bg-navy-100 text-navy-700',
    teal: 'bg-teal-100 text-teal-700',
    accent: 'bg-accent-100 text-accent-700',
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZES[size]} ${tones[tone]} ${className}`}
      title={name}
    >
      {initials(name) || '?'}
    </span>
  )
}

export default Avatar
