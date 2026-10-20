// API Vanguard Marketing.
// Jalankan: node server/index.js (PORT default 4000).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import {
  isManager,
  requireAuth,
  requireModule,
  signToken,
} from './auth.js'
import { driverKind, initStore, readAll } from './db.js'
import {
  addActivity,
  assignLead,
  canTouchLead,
  deleteCampaign,
  deleteLead,
  deletePost,
  ensureSeed,
  login,
  logEvent,
  markAllNotificationsRead,
  markNotificationRead,
  publicSnapshot,
  resetToSeed,
  saveCampaign,
  saveLandingPage,
  savePage,
  savePost,
  saveTask,
  saveUser,
  scopeSnapshot,
  submitLead,
  toggleTask,
  updateDealStage,
  updateLeadStatus,
  updateSettings,
  snapshotFor,
} from './services.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..')

// Muat .env bila ada (Node 20.12+ punya process.loadEnvFile).
try {
  process.loadEnvFile(path.join(ROOT, '.env'))
} catch {
  /* tidak ada .env, pakai environment bawaan */
}

const app = express()
const PORT = Number(process.env.PORT || 4000)

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()) : true,
  }),
)

// Pembatas percobaan login sederhana (per proses) untuk mencegah brute force.
const loginAttempts = new Map()
function loginLimiter(req, res, next) {
  const key = req.ip ?? 'unknown'
  const now = Date.now()
  const entry = loginAttempts.get(key) ?? { count: 0, resetAt: now + 60_000 }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + 60_000
  }
  entry.count += 1
  loginAttempts.set(key, entry)
  if (entry.count > 10) {
    return res.status(429).json({ error: 'Terlalu banyak percobaan masuk. Coba lagi dalam satu menit.' })
  }
  return next()
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

async function snapshotResponse(res, user, extra = {}) {
  const snapshot = await snapshotFor(user)
  return res.json({ ...extra, snapshot })
}

// --- Health & bootstrap ----------------------------------------------------
app.get('/api/health', asyncRoute(async (_req, res) => {
  res.json({ ok: true, driver: driverKind(), time: new Date().toISOString() })
}))

app.get('/api/public/bootstrap', asyncRoute(async (_req, res) => {
  const data = await readAll()
  res.json({ snapshot: publicSnapshot(data) })
}))

app.get('/api/bootstrap', requireAuth, asyncRoute(async (req, res) => {
  const snapshot = await scopeSnapshot(await readAll(), req.user)
  res.json({ snapshot })
}))

// --- Auth ------------------------------------------------------------------
app.post('/api/auth/login', loginLimiter, asyncRoute(async (req, res) => {
  const { email, password } = req.body ?? {}
  const result = await login(email, password)
  if (!result.ok) return res.status(result.status).json({ error: result.error })
  res.json({
    token: signToken(result.user),
    user: result.user,
    snapshot: await scopeSnapshot(await readAll(), result.user),
  })
}))

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// --- Lead publik -----------------------------------------------------------
app.post('/api/leads', asyncRoute(async (req, res) => {
  const { payload, channel } = req.body ?? {}
  if (!payload?.name || !payload?.email) {
    return res.status(400).json({ error: 'Nama dan email wajib diisi.' })
  }
  const result = await submitLead(payload, channel)
  res.status(201).json({ lead: result.lead, duplicate: result.duplicate })
}))

app.post('/api/events', asyncRoute(async (req, res) => {
  await logEvent(req.body ?? {})
  res.status(204).end()
}))

// --- CRM -------------------------------------------------------------------
app.patch(
  '/api/leads/:id/status',
  requireAuth,
  requireModule('leads'),
  asyncRoute(async (req, res) => {
    const data = await readAll()
    const lead = data.leads.find((item) => item.id === req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead tidak ditemukan.' })
    if (!canTouchLead(req.user, lead)) return res.status(403).json({ error: 'Lead ini bukan milik Anda.' })

    const { status, note } = req.body ?? {}
    const updated = await updateLeadStatus(lead.id, status, req.user.id, note)
    return snapshotResponse(res, req.user, { lead: updated })
  }),
)

app.patch(
  '/api/leads/:id/assign',
  requireAuth,
  requireModule('leads'),
  asyncRoute(async (req, res) => {
    if (!isManager(req.user)) return res.status(403).json({ error: 'Hanya manajer yang bisa memindahkan lead.' })
    const { userId } = req.body ?? {}
    const updated = await assignLead(req.params.id, userId, req.user.id)
    if (!updated) return res.status(404).json({ error: 'Lead tidak ditemukan.' })
    return snapshotResponse(res, req.user, { lead: updated })
  }),
)

app.post(
  '/api/leads/:id/activities',
  requireAuth,
  requireModule('leads'),
  asyncRoute(async (req, res) => {
    const data = await readAll()
    const lead = data.leads.find((item) => item.id === req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead tidak ditemukan.' })
    if (!canTouchLead(req.user, lead)) return res.status(403).json({ error: 'Lead ini bukan milik Anda.' })

    const { type, notes } = req.body ?? {}
    if (!notes?.trim()) return res.status(400).json({ error: 'Catatan aktivitas wajib diisi.' })
    const updated = await addActivity(lead.id, { type, notes: notes.trim(), createdBy: req.user.id })
    return snapshotResponse(res, req.user, { lead: updated })
  }),
)

app.delete(
  '/api/leads/:id',
  requireAuth,
  requireModule('leads'),
  asyncRoute(async (req, res) => {
    if (!isManager(req.user)) return res.status(403).json({ error: 'Hanya manajer yang bisa menghapus lead.' })
    await deleteLead(req.params.id)
    return snapshotResponse(res, req.user)
  }),
)

// --- Kampanye & landing page ----------------------------------------------
app.post(
  '/api/campaigns',
  requireAuth,
  requireModule('campaigns'),
  asyncRoute(async (req, res) => {
    const id = await saveCampaign({ ...req.body, createdBy: req.user.id })
    return snapshotResponse(res, req.user, { campaignId: id })
  }),
)

app.patch(
  '/api/campaigns/:id',
  requireAuth,
  requireModule('campaigns'),
  asyncRoute(async (req, res) => {
    const id = await saveCampaign({ ...req.body, id: req.params.id })
    if (!id) return res.status(404).json({ error: 'Kampanye tidak ditemukan.' })
    return snapshotResponse(res, req.user, { campaignId: id })
  }),
)

app.delete(
  '/api/campaigns/:id',
  requireAuth,
  requireModule('campaigns'),
  asyncRoute(async (req, res) => {
    await deleteCampaign(req.params.id)
    return snapshotResponse(res, req.user)
  }),
)

app.post(
  '/api/landing-pages',
  requireAuth,
  requireModule('campaigns', 'content'),
  asyncRoute(async (req, res) => {
    const id = await saveLandingPage(req.body)
    return snapshotResponse(res, req.user, { landingPageId: id })
  }),
)

app.patch(
  '/api/landing-pages/:id',
  requireAuth,
  requireModule('campaigns', 'content'),
  asyncRoute(async (req, res) => {
    const id = await saveLandingPage({ ...req.body, id: req.params.id })
    if (!id) return res.status(404).json({ error: 'Landing page tidak ditemukan.' })
    return snapshotResponse(res, req.user, { landingPageId: id })
  }),
)

// --- Pipeline --------------------------------------------------------------
app.patch(
  '/api/deals/:id/stage',
  requireAuth,
  requireModule('pipeline'),
  asyncRoute(async (req, res) => {
    const deal = await updateDealStage(req.params.id, req.body?.stage, req.user.id)
    if (!deal) return res.status(404).json({ error: 'Deal tidak ditemukan.' })
    return snapshotResponse(res, req.user)
  }),
)

// --- Tugas -----------------------------------------------------------------
app.post(
  '/api/tasks',
  requireAuth,
  requireModule('tasks'),
  asyncRoute(async (req, res) => {
    const payload = { ...req.body }
    if (req.user.role === 'sales') payload.assignedTo = req.user.id
    const id = await saveTask(payload)
    return snapshotResponse(res, req.user, { taskId: id })
  }),
)

app.patch(
  '/api/tasks/:id',
  requireAuth,
  requireModule('tasks'),
  asyncRoute(async (req, res) => {
    const data = await readAll()
    const task = data.tasks.find((item) => item.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
    if (req.user.role === 'sales' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Tugas ini bukan milik Anda.' })
    }
    const id = await saveTask({ ...req.body, id: task.id })
    return snapshotResponse(res, req.user, { taskId: id })
  }),
)

app.post(
  '/api/tasks/:id/toggle',
  requireAuth,
  requireModule('tasks'),
  asyncRoute(async (req, res) => {
    const data = await readAll()
    const task = data.tasks.find((item) => item.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Tugas tidak ditemukan.' })
    if (req.user.role === 'sales' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Tugas ini bukan milik Anda.' })
    }
    await toggleTask(task.id)
    return snapshotResponse(res, req.user)
  }),
)

// --- Konten ----------------------------------------------------------------
app.post(
  '/api/posts',
  requireAuth,
  requireModule('content'),
  asyncRoute(async (req, res) => {
    const id = await savePost(req.body)
    return snapshotResponse(res, req.user, { postId: id })
  }),
)

app.patch(
  '/api/posts/:id',
  requireAuth,
  requireModule('content'),
  asyncRoute(async (req, res) => {
    const id = await savePost({ ...req.body, id: req.params.id })
    if (!id) return res.status(404).json({ error: 'Artikel tidak ditemukan.' })
    return snapshotResponse(res, req.user, { postId: id })
  }),
)

app.delete(
  '/api/posts/:id',
  requireAuth,
  requireModule('content'),
  asyncRoute(async (req, res) => {
    await deletePost(req.params.id)
    return snapshotResponse(res, req.user)
  }),
)

app.post(
  '/api/pages',
  requireAuth,
  requireModule('content'),
  asyncRoute(async (req, res) => {
    const id = await savePage(req.body)
    return snapshotResponse(res, req.user, { pageId: id })
  }),
)

app.patch(
  '/api/pages/:id',
  requireAuth,
  requireModule('content'),
  asyncRoute(async (req, res) => {
    const id = await savePage({ ...req.body, id: req.params.id })
    if (!id) return res.status(404).json({ error: 'Halaman tidak ditemukan.' })
    return snapshotResponse(res, req.user, { pageId: id })
  }),
)

// --- Pengguna --------------------------------------------------------------
app.post(
  '/api/users',
  requireAuth,
  requireModule('users'),
  asyncRoute(async (req, res) => {
    const id = await saveUser(req.body)
    return snapshotResponse(res, req.user, { userId: id })
  }),
)

app.patch(
  '/api/users/:id',
  requireAuth,
  requireModule('users'),
  asyncRoute(async (req, res) => {
    const id = await saveUser({ ...req.body, id: req.params.id })
    if (!id) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' })
    return snapshotResponse(res, req.user, { userId: id })
  }),
)

// --- Notifikasi ------------------------------------------------------------
app.patch(
  '/api/notifications/:id/read',
  requireAuth,
  asyncRoute(async (req, res) => {
    await markNotificationRead(req.params.id, req.user)
    return snapshotResponse(res, req.user)
  }),
)

app.post(
  '/api/notifications/read-all',
  requireAuth,
  asyncRoute(async (req, res) => {
    await markAllNotificationsRead(req.user)
    return snapshotResponse(res, req.user)
  }),
)

// --- Pengaturan & reset ----------------------------------------------------
app.put(
  '/api/settings',
  requireAuth,
  requireModule('settings'),
  asyncRoute(async (req, res) => {
    await updateSettings(req.body ?? {})
    return snapshotResponse(res, req.user)
  }),
)

app.post(
  '/api/admin/reset',
  requireAuth,
  requireModule('settings'),
  asyncRoute(async (req, res) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Hanya Super Admin yang bisa mereset data.' })
    }
    await resetToSeed()
    return snapshotResponse(res, req.user)
  }),
)

// --- Berkas statis (opsional: satu layanan untuk frontend + API) -----------
const distDir = path.join(ROOT, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    return res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' })
})

// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  console.error('[api]', error)
  const status = error.status || 500
  res.status(status).json({ error: status === 500 ? 'Terjadi kesalahan di server.' : error.message })
})

async function start() {
  await initStore()
  const seeded = await ensureSeed()
  if (!process.env.JWT_SECRET) {
    console.warn('[api] JWT_SECRET belum diatur — memakai nilai pengembangan. Wajib diisi saat produksi.')
  }
  app.listen(PORT, () => {
    console.log(`[api] siap di http://localhost:${PORT} (driver: ${driverKind()})${seeded ? ' — data contoh dibuat' : ''}`)
  })
}

start().catch((error) => {
  console.error('[api] gagal start:', error)
  process.exit(1)
})
