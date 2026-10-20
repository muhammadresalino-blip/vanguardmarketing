// Klien API tipis di atas fetch.
//
// Di pengembangan, Vite mem-proxy /api ke http://localhost:4000 (lihat
// vite.config.js). Saat deploy terpisah, isi VITE_API_URL dengan URL API,
// misalnya https://vanguard-api.onrender.com.

import { removeStore, readStore, writeStore, STORAGE_KEYS } from './storage.js'

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_PREFIX = `${BASE_URL}/api`

export function getSession() {
  return readStore(STORAGE_KEYS.session, null)
}

export function getToken() {
  return getSession()?.token ?? null
}

export function saveSession(session) {
  writeStore(STORAGE_KEYS.session, session)
}

export function clearSession() {
  removeStore(STORAGE_KEYS.session)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Tidak bisa menghubungi server. Pastikan API berjalan (pnpm dev:api).')
  }

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    if (response.status === 401 && auth) clearSession()
    const error = new Error(data?.error || `Permintaan gagal (${response.status}).`)
    error.status = response.status
    throw error
  }

  return data
}

// --- Bootstrap & auth ------------------------------------------------------
export async function fetchBootstrap() {
  if (getToken()) {
    try {
      return await request('/bootstrap')
    } catch (error) {
      if (error.status !== 401) throw error
    }
  }
  return request('/public/bootstrap', { auth: false })
}

export async function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password }, auth: false })
}

// --- Lead publik -----------------------------------------------------------
export async function submitLead(payload, channel) {
  return request('/leads', { method: 'POST', body: { payload, channel }, auth: false })
}

export function logEvent(event) {
  // Kegagalan pencatatan analitik tidak boleh mengganggu pengunjung.
  return request('/events', { method: 'POST', body: event, auth: false }).catch(() => null)
}

// --- CRM -------------------------------------------------------------------
export function updateLeadStatus(leadId, status, note) {
  return request(`/leads/${leadId}/status`, { method: 'PATCH', body: { status, note } })
}

export function assignLead(leadId, userId) {
  return request(`/leads/${leadId}/assign`, { method: 'PATCH', body: { userId } })
}

export function addActivity(leadId, activity) {
  return request(`/leads/${leadId}/activities`, { method: 'POST', body: activity })
}

export function deleteLead(leadId) {
  return request(`/leads/${leadId}`, { method: 'DELETE' })
}

// --- Kampanye & landing page ----------------------------------------------
export function createCampaign(payload) {
  return request('/campaigns', { method: 'POST', body: payload })
}

export function updateCampaign(id, payload) {
  return request(`/campaigns/${id}`, { method: 'PATCH', body: payload })
}

export function deleteCampaign(id) {
  return request(`/campaigns/${id}`, { method: 'DELETE' })
}

export function createLandingPage(payload) {
  return request('/landing-pages', { method: 'POST', body: payload })
}

export function updateLandingPage(id, payload) {
  return request(`/landing-pages/${id}`, { method: 'PATCH', body: payload })
}

// --- Pipeline --------------------------------------------------------------
export function updateDealStage(dealId, stage) {
  return request(`/deals/${dealId}/stage`, { method: 'PATCH', body: { stage } })
}

// --- Tugas -----------------------------------------------------------------
export function createTask(payload) {
  return request('/tasks', { method: 'POST', body: payload })
}

export function updateTask(id, payload) {
  return request(`/tasks/${id}`, { method: 'PATCH', body: payload })
}

export function toggleTask(taskId) {
  return request(`/tasks/${taskId}/toggle`, { method: 'POST' })
}

// --- Konten ----------------------------------------------------------------
export function createPost(payload) {
  return request('/posts', { method: 'POST', body: payload })
}

export function updatePost(id, payload) {
  return request(`/posts/${id}`, { method: 'PATCH', body: payload })
}

export function deletePost(id) {
  return request(`/posts/${id}`, { method: 'DELETE' })
}

export function createPage(payload) {
  return request('/pages', { method: 'POST', body: payload })
}

export function updatePage(id, payload) {
  return request(`/pages/${id}`, { method: 'PATCH', body: payload })
}

// --- Pengguna --------------------------------------------------------------
export function createUser(payload) {
  return request('/users', { method: 'POST', body: payload })
}

export function updateUser(id, payload) {
  return request(`/users/${id}`, { method: 'PATCH', body: payload })
}

// --- Notifikasi ------------------------------------------------------------
export function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PATCH' })
}

export function markAllNotificationsRead() {
  return request('/notifications/read-all', { method: 'POST' })
}

// --- Pengaturan ------------------------------------------------------------
export function updateSettings(patch) {
  return request('/settings', { method: 'PUT', body: patch })
}

export function resetData() {
  return request('/admin/reset', { method: 'POST' })
}
