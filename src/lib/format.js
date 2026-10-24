// Helper format angka, tanggal, dan teks bahasa Indonesia.

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('id-ID')

export function formatCurrency(value) {
  return idr.format(Number(value) || 0)
}

export function formatRupiah(value) {
  const n = Number(value) || 0
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1).replace('.0', '')}B`
  if (n >= 1_000_000) return `Rp${Math.round(n / 1_000_000)}M`
  return `Rp${n.toLocaleString('id-ID')}`
}

export function formatCompactCurrency(value) {
  const n = Number(value) || 0
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)} M`
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)} jt`
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)} rb`
  return `Rp${n}`
}

export function formatNumber(value) {
  return number.format(Number(value) || 0)
}

export function formatPercent(value, digits = 1) {
  return `${(Number(value) || 0).toFixed(digits)}%`
}

export function formatDate(value, options = {}) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${formatDate(date)} ${date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function formatRelativeTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} bulan lalu`
  return `${Math.round(months / 12)} tahun lalu`
}

export function daysAgo(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000))
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function truncate(text = '', max = 120) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

export function isValidPhone(value = '') {
  const digits = value.replace(/[^\d]/g, '')
  return digits.length >= 9 && digits.length <= 15
}

// Normalisasi nomor telepon Indonesia ke format 62xxx untuk link WhatsApp.
export function toWhatsAppNumber(phone = '') {
  let digits = phone.replace(/[^\d]/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  if (!digits.startsWith('62')) digits = `62${digits}`
  return digits
}

export function csvEscape(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => csvEscape(row[c.key])).join(','))
    .join('\n')
  return `${header}\n${body}`
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}