// Konstanta domain Vanguard Marketing.
// Semua label status/channel terpusat di sini supaya konsisten di seluruh UI.

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', tone: 'navy' },
  { value: 'contacted', label: 'Contacted', tone: 'sky' },
  { value: 'qualified', label: 'Qualified', tone: 'teal' },
  { value: 'proposal', label: 'Proposal', tone: 'accent' },
  { value: 'won', label: 'Won', tone: 'green' },
  { value: 'lost', label: 'Lost', tone: 'red' },
]

export const LEAD_STATUS_VALUES = LEAD_STATUSES.map((s) => s.value)

export const PIPELINE_STAGES = [
  { value: 'contacted', label: 'Contacted', probability: 20 },
  { value: 'qualified', label: 'Qualified', probability: 45 },
  { value: 'proposal', label: 'Proposal', probability: 70 },
  { value: 'won', label: 'Won', probability: 100 },
  { value: 'lost', label: 'Lost', probability: 0 },
]

export const LEAD_SOURCES = [
  'Organic Search',
  'Google Ads',
  'Meta Ads',
  'LinkedIn',
  'Email Campaign',
  'Referral',
  'Social Media',
  'Direct',
]

export const CAMPAIGN_CHANNELS = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'email', label: 'Email' },
  { value: 'organic', label: 'Organic / SEO' },
  { value: 'social', label: 'Social Media' },
  { value: 'referral', label: 'Referral' },
]

export const CHANNEL_LABEL = CAMPAIGN_CHANNELS.reduce((acc, c) => {
  acc[c.value] = c.label
  return acc
}, {})

export const CAMPAIGN_STATUSES = [
  { value: 'draft', label: 'Draft', tone: 'slate' },
  { value: 'active', label: 'Aktif', tone: 'green' },
  { value: 'paused', label: 'Paused', tone: 'accent' },
  { value: 'completed', label: 'Selesai', tone: 'navy' },
]

export const ACTIVITY_TYPES = [
  { value: 'note', label: 'Catatan' },
  { value: 'call', label: 'Telepon' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'status_change', label: 'Perubahan Status' },
  { value: 'assignment', label: 'Penugasan' },
]

export const ACTIVITY_LABEL = ACTIVITY_TYPES.reduce((acc, a) => {
  acc[a.value] = a.label
  return acc
}, {})

export const TASK_TYPES = [
  { value: 'call', label: 'Telepon prospek' },
  { value: 'email', label: 'Kirim email' },
  { value: 'meeting', label: 'Jadwalkan meeting' },
  { value: 'follow_up', label: 'Follow-up umum' },
  { value: 'proposal', label: 'Kirim proposal' },
]

export const ROLES = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Kontrol penuh: user, role, konten, integrasi, konfigurasi sistem.',
    permissions: ['portal', 'marketing', 'crm', 'analytics', 'admin'],
  },
  {
    value: 'marketing_manager',
    label: 'Marketing Manager',
    description: 'Menjalankan kampanye, memantau lead, menganalisis performa kanal.',
    permissions: ['portal', 'marketing', 'crm', 'analytics'],
  },
  {
    value: 'sales',
    label: 'Sales',
    description: 'Mengelola pipeline, follow-up, dan update status lead miliknya.',
    permissions: ['crm'],
  },
  {
    value: 'content_editor',
    label: 'Content Editor',
    description: 'Mengelola artikel, halaman, dan materi promosi.',
    permissions: ['portal'],
  },
  {
    value: 'support',
    label: 'Customer Support',
    description: 'Melihat lead masuk dan menjawab pertanyaan prospek.',
    permissions: ['crm'],
  },
]

export const ROLE_LABEL = ROLES.reduce((acc, r) => {
  acc[r.value] = r.label
  return acc
}, {})

// Modul yang bisa diakses tiap role, dipakai untuk menu sidebar & guard halaman.
export const MODULE_ACCESS = {
  dashboard: ['super_admin', 'marketing_manager', 'sales', 'content_editor', 'support'],
  campaigns: ['super_admin', 'marketing_manager'],
  leads: ['super_admin', 'marketing_manager', 'sales', 'support'],
  pipeline: ['super_admin', 'marketing_manager', 'sales'],
  tasks: ['super_admin', 'marketing_manager', 'sales'],
  analytics: ['super_admin', 'marketing_manager'],
  content: ['super_admin', 'marketing_manager', 'content_editor'],
  users: ['super_admin'],
  settings: ['super_admin'],
}

export const BLOG_CATEGORIES = [
  'Lead Generation',
  'SEO',
  'Paid Ads',
  'CRM & Sales',
  'Automation',
]
