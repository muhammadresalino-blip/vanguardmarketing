// Logika bisnis sisi server. Semua aturan yang sebelumnya hidup di DataContext
// (anti-duplikat, rotasi sales, deal otomatis, SLA) dipindahkan ke sini agar
// berlaku untuk semua klien, bukan hanya browser yang sedang dipakai.

import crypto from 'node:crypto'
import { readAll, readCredential, replaceAll, replaceCredentials, setCredential, writeRecords, writeSettings, deleteRecord } from './db.js'
import { hashPassword, verifyPassword } from './auth.js'
import { createSeedData, DEMO_PASSWORD } from '../src/lib/seed.js'

export function nowIso() {
  return new Date().toISOString()
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function normalizePhone(value = '') {
  return String(value).replace(/[^\d]/g, '')
}

function withoutId(payload) {
  const { id: _ignored, password: _password, ...rest } = payload
  return rest
}

function toMinutes(fromIso, toIso) {
  return Math.max(1, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000))
}

// --- Seed & reset ----------------------------------------------------------
export async function resetToSeed() {
  const seed = createSeedData()
  await replaceAll(seed)
  await replaceCredentials(seed.users.map((user) => [user.id, hashPassword(DEMO_PASSWORD)]))
  return seed
}

export async function ensureSeed() {
  const data = await readAll()
  const total = Object.values(data).reduce((sum, value) => (Array.isArray(value) ? sum + value.length : sum), 0)
  if (total > 0) return false
  await resetToSeed()
  return true
}

// --- Snapshot & pembatasan data -------------------------------------------
function publicCampaign(campaign) {
  return {
    id: campaign.id,
    name: campaign.name,
    channel: campaign.channel,
    status: campaign.status,
    landingPageSlug: campaign.landingPageSlug ?? null,
    startDate: campaign.startDate ?? null,
    endDate: campaign.endDate ?? null,
  }
}

export function publicSnapshot(data) {
  return {
    users: [],
    campaigns: data.campaigns.filter((campaign) => campaign.status !== 'archived').map(publicCampaign),
    landingPages: data.landingPages.filter((page) => page.status === 'published'),
    posts: data.posts.filter((post) => post.status === 'published'),
    pages: data.pages.filter((page) => page.status !== 'draft'),
    leads: [],
    activities: [],
    deals: [],
    tasks: [],
    notifications: [],
    events: [],
    settings: data.settings ?? {},
    meta: data.meta ?? null,
  }
}

export function scopeSnapshot(data, user) {
  if (!user) return publicSnapshot(data)
  if (user.role === 'sales') {
    const ownLeads = data.leads.filter((lead) => lead.assignedTo === user.id)
    const leadIds = new Set(ownLeads.map((lead) => lead.id))
    return {
      ...data,
      leads: ownLeads,
      activities: data.activities.filter((activity) => leadIds.has(activity.leadId)),
      deals: data.deals.filter((deal) => leadIds.has(deal.leadId)),
      tasks: data.tasks.filter((task) => task.assignedTo === user.id),
      notifications: data.notifications.filter((notification) => notification.userId === user.id),
    }
  }
  return {
    ...data,
    notifications: data.notifications.filter(
      (notification) => notification.userId === user.id || notification.userId === 'system',
    ),
  }
}

export async function snapshotFor(user) {
  return scopeSnapshot(await readAll(), user)
}

export function canTouchLead(user, lead) {
  if (!lead) return false
  if (['super_admin', 'marketing_manager', 'support'].includes(user?.role)) return true
  return lead.assignedTo === user?.id
}

// --- Autentikasi -----------------------------------------------------------
export async function login(email, password) {
  const data = await readAll()
  const user = data.users.find((item) => normalizeEmail(item.email) === normalizeEmail(email))
  if (!user) return { ok: false, status: 401, error: 'Email tidak terdaftar sebagai pengguna platform.' }
  if (user.status !== 'active') return { ok: false, status: 403, error: 'Akun ini nonaktif. Hubungi Super Admin.' }
  if (!password || password.length < 6) return { ok: false, status: 400, error: 'Kata sandi minimal 6 karakter.' }

  const stored = await readCredential(user.id)
  if (!stored || !verifyPassword(password, stored)) {
    return { ok: false, status: 401, error: 'Kata sandi salah.' }
  }

  const now = nowIso()
  const updated = { ...user, lastLoginAt: now }
  await writeRecords('users', [updated])
  return { ok: true, user: updated }
}

// --- Leads -----------------------------------------------------------------
export function findDuplicateLead(payload, leads) {
  const email = normalizeEmail(payload.email)
  const phone = normalizePhone(payload.phone)
  if (!email && !phone) return null
  return (
    leads.find(
      (lead) =>
        (email && normalizeEmail(lead.email) === email) ||
        (phone && normalizePhone(lead.phone) === phone),
    ) ?? null
  )
}

export async function submitLead(payload, channel = 'form website') {
  const data = await readAll()
  const now = nowIso()
  const duplicate = findDuplicateLead(payload, data.leads)

  if (duplicate) {
    const updated = {
      ...duplicate,
      name: payload.name || duplicate.name,
      company: payload.company || duplicate.company,
      jobTitle: payload.jobTitle || duplicate.jobTitle,
      message: payload.message || duplicate.message,
      campaignId: payload.campaignId ?? duplicate.campaignId,
      utmSource: payload.utmSource ?? duplicate.utmSource,
      utmMedium: payload.utmMedium ?? duplicate.utmMedium,
      utmCampaign: payload.utmCampaign ?? duplicate.utmCampaign,
      updatedAt: now,
    }
    const activity = {
      id: uid('act'),
      leadId: duplicate.id,
      type: 'note',
      notes: `Formulir dikirim ulang (${channel}). Data lead diperbarui, bukan dibuat baru.`,
      createdBy: 'system',
      createdAt: now,
    }

    await writeRecords('leads', [updated])
    await writeRecords('activities', [activity])
    return { lead: updated, duplicate: true }
  }

  const activeSales = data.users.filter((user) => user.role === 'sales' && user.status === 'active')
  const assignedTo = activeSales.length ? activeSales[data.leads.length % activeSales.length].id : null

  const lead = {
    id: uid('lead'),
    status: 'new',
    assignedTo,
    consent: Boolean(payload.consent),
    responseMinutes: null,
    contactedAt: null,
    createdAt: now,
    updatedAt: now,
    ...payload,
  }

  const activity = {
    id: uid('act'),
    leadId: lead.id,
    type: 'status_change',
    notes: `Lead dibuat dari ${channel} dengan status New.`,
    createdBy: 'system',
    createdAt: now,
    meta: { from: null, to: 'new' },
  }
  const activities = [activity]
  if (lead.assignedTo) {
    activities.push({
      id: uid('act'),
      leadId: lead.id,
      type: 'assignment',
      notes: 'Lead ditugaskan otomatis ke sales sesuai rotasi.',
      createdBy: 'system',
      createdAt: now,
    })
  }

  await writeRecords('leads', [lead])
  await writeRecords('activities', activities)

  if (lead.assignedTo) {
    await writeRecords('notifications', [
      {
        id: uid('ntf'),
        userId: lead.assignedTo,
        type: 'lead_assigned',
        message: `Lead baru dari ${lead.source}: ${lead.name} (${lead.company}).`,
        leadId: lead.id,
        read: false,
        createdAt: now,
      },
    ])
  }

  await writeRecords('events', [
    {
      id: uid('evt'),
      eventName: 'form_submit',
      campaignId: lead.campaignId ?? null,
      source: lead.source,
      pageUrl: lead.landingPage ? `/lp/${lead.landingPage}` : '/contact',
      utmSource: lead.utmSource ?? null,
      utmMedium: lead.utmMedium ?? null,
      device: payload.device ?? 'desktop',
      sessionMinutes: 1,
      createdAt: now,
    },
  ])

  return { lead, duplicate: false }
}

export async function updateLeadStatus(leadId, status, actor, note) {
  const data = await readAll()
  const target = data.leads.find((lead) => lead.id === leadId)
  if (!target) return null

  const now = nowIso()
  const stamp = {}
  if (status !== 'new' && !target.contactedAt) {
    stamp.contactedAt = now
    stamp.responseMinutes = toMinutes(target.createdAt, now)
  }

  const updatedLead = { ...target, ...stamp, status, updatedAt: now }
  const dealExisted = data.deals.some((deal) => deal.leadId === leadId)
  const probability = { contacted: 20, qualified: 45, proposal: 70, won: 100, lost: 0 }[status]

  const writes = [[ 'leads', [updatedLead] ]]

  if (['qualified', 'proposal', 'won', 'lost'].includes(status) && !dealExisted) {
    writes.push([
      'deals',
      [
        {
          id: uid('deal'),
          leadId,
          dealName: `${target.company} — ${target.utmCampaign ?? 'Paket Digital Marketing'}`,
          value: target.budgetEstimate ?? 0,
          stage: status,
          probability,
          expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          ownerId: target.assignedTo,
          createdAt: now,
          updatedAt: now,
        },
      ],
    ])
  } else if (dealExisted) {
    const deal = data.deals.find((item) => item.leadId === leadId)
    writes.push(['deals', [{ ...deal, stage: status, probability, updatedAt: now }]])
  }

  writes.push([
    'activities',
    [
      {
        id: uid('act'),
        leadId,
        type: 'status_change',
        notes: note ?? `Status diperbarui dari ${target.status} menjadi ${status}.`,
        createdBy: actor ?? 'system',
        createdAt: now,
        meta: { from: target.status, to: status },
      },
    ],
  ])

  if (['won', 'lost'].includes(status)) {
    const closingTasks = data.tasks
      .filter((task) => task.leadId === leadId && task.status === 'open')
      .map((task) => ({ ...task, status: 'done' }))
    if (closingTasks.length) writes.push(['tasks', closingTasks])
  }

  for (const [collection, items] of writes) {
    await writeRecords(collection, items)
  }

  return updatedLead
}

export async function assignLead(leadId, userId, actor) {
  const data = await readAll()
  const lead = data.leads.find((item) => item.id === leadId)
  if (!lead) return null
  const user = data.users.find((item) => item.id === userId)
  const now = nowIso()

  await writeRecords('leads', [{ ...lead, assignedTo: userId, updatedAt: now }])
  await writeRecords('activities', [
    {
      id: uid('act'),
      leadId,
      type: 'assignment',
      notes: `Lead ditugaskan kepada ${user?.name ?? 'sales'}.`,
      createdBy: actor ?? 'system',
      createdAt: now,
    },
  ])
  if (user) {
    await writeRecords('notifications', [
      {
        id: uid('ntf'),
        userId,
        type: 'lead_assigned',
        message: `Lead ${lead.name} ditugaskan kepada Anda.`,
        leadId,
        read: false,
        createdAt: now,
      },
    ])
  }

  return { ...lead, assignedTo: userId, updatedAt: now }
}

export async function addActivity(leadId, { type, notes, createdBy }) {
  const data = await readAll()
  const lead = data.leads.find((item) => item.id === leadId)
  if (!lead) return null

  const now = nowIso()
  const isContact = ['call', 'email', 'whatsapp', 'meeting'].includes(type)
  const updated = {
    ...lead,
    updatedAt: now,
    contactedAt: lead.contactedAt ?? (isContact ? now : lead.contactedAt),
    responseMinutes:
      lead.responseMinutes ?? (isContact ? toMinutes(lead.createdAt, now) : lead.responseMinutes),
  }

  await writeRecords('activities', [
    { id: uid('act'), leadId, type, notes, createdBy, createdAt: now },
  ])
  await writeRecords('leads', [updated])
  return updated
}

export async function deleteLead(leadId) {
  const data = await readAll()
  const activityIds = data.activities.filter((item) => item.leadId === leadId).map((item) => item.id)
  const dealIds = data.deals.filter((item) => item.leadId === leadId).map((item) => item.id)
  const taskIds = data.tasks.filter((item) => item.leadId === leadId).map((item) => item.id)

  await deleteRecord('leads', leadId)
  for (const [collection, ids] of [
    ['activities', activityIds],
    ['deals', dealIds],
    ['tasks', taskIds],
  ]) {
    for (const id of ids) await deleteRecord(collection, id)
  }
}

// --- Kampanye & landing page ----------------------------------------------
export async function saveCampaign(payload) {
  const now = nowIso()
  if (payload.id) {
    const data = await readAll()
    const existing = data.campaigns.find((item) => item.id === payload.id)
    if (!existing) return null
    const updated = { ...existing, ...payload, updatedAt: now }
    await writeRecords('campaigns', [updated])
    return updated.id
  }

  const campaign = { ...withoutId(payload), id: uid('cmp'), createdAt: now }
  await writeRecords('campaigns', [campaign])
  return campaign.id
}

export async function deleteCampaign(campaignId) {
  const data = await readAll()
  await deleteRecord('campaigns', campaignId)
  for (const page of data.landingPages.filter((item) => item.campaignId === campaignId)) {
    await deleteRecord('landingPages', page.id)
  }
}

export async function saveLandingPage(payload) {
  const now = nowIso()
  if (payload.id) {
    const data = await readAll()
    const existing = data.landingPages.find((item) => item.id === payload.id)
    if (!existing) return null
    const updated = { ...existing, ...payload, updatedAt: now }
    await writeRecords('landingPages', [updated])
    return updated.id
  }
  const page = {
    ...withoutId(payload),
    id: uid('lp'),
    sections: [],
    createdAt: now,
    updatedAt: now,
  }
  await writeRecords('landingPages', [page])
  return page.id
}

// --- Deal & tugas ----------------------------------------------------------
export async function updateDealStage(dealId, stage, actor) {
  const data = await readAll()
  const deal = data.deals.find((item) => item.id === dealId)
  if (!deal) return null

  const now = nowIso()
  const probability = { contacted: 20, qualified: 45, proposal: 70, won: 100, lost: 0 }[stage]
  const updated = { ...deal, stage, probability, updatedAt: now }
  await writeRecords('deals', [updated])

  const lead = data.leads.find((item) => item.id === deal.leadId)
  if (lead) {
    await writeRecords('leads', [{ ...lead, status: stage, updatedAt: now }])
    await writeRecords('activities', [
      {
        id: uid('act'),
        leadId: deal.leadId,
        type: 'status_change',
        notes: `Tahap deal dipindahkan ke ${stage}.`,
        createdBy: actor ?? 'system',
        createdAt: now,
        meta: { from: deal.stage, to: stage },
      },
    ])
  }

  return updated
}

export async function saveTask(payload) {
  if (payload.id) {
    const data = await readAll()
    const existing = data.tasks.find((item) => item.id === payload.id)
    if (!existing) return null
    const updated = { ...existing, ...payload }
    await writeRecords('tasks', [updated])
    return updated.id
  }

  const task = {
    ...withoutId(payload),
    id: uid('task'),
    status: 'open',
    createdAt: nowIso(),
  }
  await writeRecords('tasks', [task])
  return task.id
}

export async function toggleTask(taskId) {
  const data = await readAll()
  const task = data.tasks.find((item) => item.id === taskId)
  if (!task) return null
  const updated = { ...task, status: task.status === 'open' ? 'done' : 'open' }
  await writeRecords('tasks', [updated])
  return updated
}

// --- Konten ----------------------------------------------------------------
export async function savePost(payload) {
  if (payload.id) {
    const data = await readAll()
    const existing = data.posts.find((item) => item.id === payload.id)
    if (!existing) return null
    const updated = { ...existing, ...payload }
    await writeRecords('posts', [updated])
    return updated.id
  }

  const post = {
    ...withoutId(payload),
    id: uid('post'),
    status: payload.status ?? 'draft',
    views: payload.views ?? 0,
    readMinutes: payload.readMinutes ?? 4,
    createdAt: nowIso(),
  }
  await writeRecords('posts', [post])
  return post.id
}

export async function deletePost(postId) {
  await deleteRecord('posts', postId)
}

export async function savePage(payload) {
  if (payload.id) {
    const data = await readAll()
    const existing = data.pages.find((item) => item.id === payload.id)
    if (!existing) return null
    const updated = { ...existing, ...payload, updatedAt: nowIso() }
    await writeRecords('pages', [updated])
    return updated.id
  }

  const page = {
    ...withoutId(payload),
    id: uid('page'),
    status: payload.status ?? 'draft',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  await writeRecords('pages', [page])
  return page.id
}

// --- Pengguna --------------------------------------------------------------
export async function saveUser(payload) {
  const data = await readAll()
  const email = normalizeEmail(payload.email)
  const duplicate = data.users.find(
    (item) => normalizeEmail(item.email) === email && item.id !== payload.id,
  )
  if (duplicate) {
    const error = new Error('Email sudah dipakai pengguna lain.')
    error.status = 409
    throw error
  }

  if (payload.id) {
    const existing = data.users.find((item) => item.id === payload.id)
    if (!existing) return null

    const updated = { ...existing, ...withoutId(payload) }
    await writeRecords('users', [updated])
    if (payload.password) await setCredential(updated.id, hashPassword(payload.password))
    return updated.id
  }

  const user = {
    ...withoutId(payload),
    id: uid('usr'),
    status: payload.status ?? 'active',
    createdAt: nowIso(),
    lastLoginAt: null,
  }
  await writeRecords('users', [user])
  await setCredential(user.id, hashPassword(payload.password || DEMO_PASSWORD))
  return user.id
}

// --- Notifikasi, pengaturan, event ----------------------------------------
export async function markNotificationRead(notificationId, user) {
  const data = await readAll()
  const notification = data.notifications.find((item) => item.id === notificationId)
  if (!notification) return null
  if (notification.userId !== user.id && notification.userId !== 'system' && user.role !== 'super_admin') {
    return null
  }
  await writeRecords('notifications', [{ ...notification, read: true }])
  return notificationId
}

export async function markAllNotificationsRead(user) {
  const data = await readAll()
  const items = data.notifications
    .filter((item) => item.userId === user.id || item.userId === 'system')
    .map((item) => ({ ...item, read: true }))
  await writeRecords('notifications', items)
  return items.length
}

export async function updateSettings(patch) {
  return writeSettings(patch)
}

export async function logEvent(event) {
  const item = {
    id: uid('evt'),
    createdAt: nowIso(),
    device: 'desktop',
    sessionMinutes: 1,
    ...event,
  }
  await writeRecords('events', [item])
  return item.id
}
