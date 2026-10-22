import { ChartColumn, Filter, Link2, Mail, Megaphone, Target } from 'lucide-react'

// Icon modul layanan — key dari lib/content.js (icon field), gaya outline
// biru primer di tile terang sesuai style guide.
const ICONS = {
  target: Target,
  campaign: Megaphone,
  link: Link2,
  pipeline: Filter,
  email: Mail,
  analytics: ChartColumn,
}

export function ServiceIcon({ name, className = 'h-6 w-6' }) {
  const Icon = ICONS[name] ?? Target
  return <Icon className={`${className} text-primary-600`} strokeWidth={1.75} aria-hidden="true" />
}

export default ServiceIcon
