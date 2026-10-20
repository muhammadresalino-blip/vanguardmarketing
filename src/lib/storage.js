// Lapisan penyimpanan sederhana di atas localStorage.
// Dipakai sebagai pengganti database pada MVP (SPA + data lokal).
// Semua data disimpan di satu namespace agar mudah di-reset dari halaman Settings.

const NAMESPACE = 'vanguard_marketing'

export const STORAGE_KEYS = {
  leads: 'leads',
  campaigns: 'campaigns',
  activities: 'lead_activities',
  deals: 'deals',
  tasks: 'tasks',
  notifications: 'notifications',
  posts: 'posts',
  pages: 'pages',
  users: 'users',
  settings: 'settings',
  events: 'analytics_events',
  session: 'session',
  utm: 'utm_context',
}

function fullKey(key) {
  return `${NAMESPACE}.${key}`
}

export function readStore(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(fullKey(key))
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value))
    return true
  } catch {
    // Kuota penuh atau localStorage diblokir: abaikan supaya UI tetap jalan.
    return false
  }
}

export function removeStore(key) {
  try {
    window.localStorage.removeItem(fullKey(key))
  } catch {
    /* noop */
  }
}

export function clearAll() {
  Object.values(STORAGE_KEYS).forEach((key) => removeStore(key))
}

export function uid(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${rand}`
}
