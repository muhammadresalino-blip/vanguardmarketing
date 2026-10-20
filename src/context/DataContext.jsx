/* oxlint-disable react/only-export-components -- satu file berisi provider + hook pasangannya */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as api from '../lib/api.js'
import { LEAD_STATUSES, ROLES } from '../lib/constants.js'

const DataContext = createContext(null)

// Urutan status untuk perhitungan waktu respons.
const STATUS_FLOW = LEAD_STATUSES.map((s) => s.value)

const EMPTY_STATE = {
  users: [],
  campaigns: [],
  landingPages: [],
  posts: [],
  pages: [],
  leads: [],
  activities: [],
  deals: [],
  tasks: [],
  notifications: [],
  events: [],
  settings: {},
  meta: null,
}

// Sumber data sekarang adalah API (server + database). State di sini hanya
// salinan snapshot terakhir supaya halaman tetap reaktif tanpa fetch ulang
// di setiap komponen. Setiap aksi mengirim perubahan ke server, lalu server
// mengembalikan snapshot terbaru yang sudah dibatasi sesuai peran pengguna.
export function DataProvider({ children }) {
  const [state, setState] = useState({ ...EMPTY_STATE, loading: true, error: null })
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const applySnapshot = useCallback((snapshot) => {
    if (!mounted.current || !snapshot) return
    setState({ ...EMPTY_STATE, ...snapshot, loading: false, error: null })
  }, [])

  const refresh = useCallback(async () => {
    try {
      const { snapshot } = await api.fetchBootstrap()
      applySnapshot(snapshot)
      return snapshot
    } catch (error) {
      if (mounted.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }))
      }
      return null
    }
  }, [applySnapshot])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Jalankan aksi ke server. Snapshot baru (bila ada) langsung dipakai;
  // kegagalan dicatat di console agar aksi "tembak-lupakan" tidak membuat
  // aplikasi berhenti, sementara pemanggil yang butuh pesan error tetap
  // menerima nilai null.
  const run = useCallback(
    async (action) => {
      try {
        const result = await action()
        if (result?.snapshot) applySnapshot(result.snapshot)
        return result
      } catch (error) {
        console.error('[api]', error.message)
        return null
      }
    },
    [applySnapshot],
  )

  // --- Leads ---------------------------------------------------------------
  const submitLead = useCallback(
    async (payload, { channel = 'website' } = {}) => {
      const result = await run(() => api.submitLead(payload, channel))
      if (!result?.lead) return null
      // Bila pengunjung sedang login, segarkan panel admin di latar belakang.
      if (api.getToken()) refresh()
      return { lead: result.lead, duplicate: Boolean(result.duplicate) }
    },
    [run, refresh],
  )

  const updateLeadStatus = useCallback(
    (leadId, status, _actor, note) => run(() => api.updateLeadStatus(leadId, status, note)),
    [run],
  )

  const assignLead = useCallback(
    (leadId, userId) => run(() => api.assignLead(leadId, userId)),
    [run],
  )

  const addActivity = useCallback(
    (leadId, activity) => run(() => api.addActivity(leadId, activity)),
    [run],
  )

  const deleteLead = useCallback((leadId) => run(() => api.deleteLead(leadId)), [run])

  // --- Kampanye & landing page --------------------------------------------
  const saveCampaign = useCallback(
    async (payload) => {
      const result = await run(() =>
        payload.id ? api.updateCampaign(payload.id, payload) : api.createCampaign(payload),
      )
      return result?.campaignId ?? null
    },
    [run],
  )

  const deleteCampaign = useCallback((campaignId) => run(() => api.deleteCampaign(campaignId)), [run])

  const saveLandingPage = useCallback(
    (payload) =>
      run(() =>
        payload.id ? api.updateLandingPage(payload.id, payload) : api.createLandingPage(payload),
      ),
    [run],
  )

  // --- Deals & tasks -------------------------------------------------------
  const updateDealStage = useCallback(
    (dealId, stage) => run(() => api.updateDealStage(dealId, stage)),
    [run],
  )

  const saveTask = useCallback(
    (payload) => run(() => (payload.id ? api.updateTask(payload.id, payload) : api.createTask(payload))),
    [run],
  )

  const toggleTask = useCallback((taskId) => run(() => api.toggleTask(taskId)), [run])

  // --- Konten --------------------------------------------------------------
  const savePost = useCallback(
    (payload) => run(() => (payload.id ? api.updatePost(payload.id, payload) : api.createPost(payload))),
    [run],
  )

  const deletePost = useCallback((postId) => run(() => api.deletePost(postId)), [run])

  const savePage = useCallback(
    (payload) => run(() => (payload.id ? api.updatePage(payload.id, payload) : api.createPage(payload))),
    [run],
  )

  // --- Users ---------------------------------------------------------------
  const saveUser = useCallback(
    (payload) => run(() => (payload.id ? api.updateUser(payload.id, payload) : api.createUser(payload))),
    [run],
  )

  // --- Notifikasi ----------------------------------------------------------
  const markNotificationRead = useCallback(
    (notificationId) => run(() => api.markNotificationRead(notificationId)),
    [run],
  )

  const markAllNotificationsRead = useCallback(
    (_userId) => run(() => api.markAllNotificationsRead()),
    [run],
  )

  // --- Pengaturan & utilitas ----------------------------------------------
  const updateSettings = useCallback((patch) => run(() => api.updateSettings(patch)), [run])

  const resetData = useCallback(() => run(() => api.resetData()), [run])

  // Event analitik tidak memakai snapshot agar tidak memicu render seluruh
  // halaman setiap kali pengunjung berpindah halaman.
  const logEvent = useCallback((event) => api.logEvent(event), [])

  const value = useMemo(
    () => ({
      ...state,
      roles: ROLES,
      submitLead,
      updateLeadStatus,
      assignLead,
      addActivity,
      deleteLead,
      saveCampaign,
      deleteCampaign,
      saveLandingPage,
      updateDealStage,
      saveTask,
      toggleTask,
      savePost,
      deletePost,
      savePage,
      saveUser,
      markNotificationRead,
      markAllNotificationsRead,
      updateSettings,
      resetData,
      logEvent,
      refresh,
      STATUS_FLOW,
    }),
    [
      state,
      submitLead,
      updateLeadStatus,
      assignLead,
      addActivity,
      deleteLead,
      saveCampaign,
      deleteCampaign,
      saveLandingPage,
      updateDealStage,
      saveTask,
      toggleTask,
      savePost,
      deletePost,
      savePage,
      saveUser,
      markNotificationRead,
      markAllNotificationsRead,
      updateSettings,
      resetData,
      logEvent,
      refresh,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData harus dipakai di dalam DataProvider')
  return context
}

// ---- Selector kecil yang sering dipakai halaman ---------------------------
export function useLead(id) {
  const { leads } = useData()
  return leads.find((lead) => lead.id === id) ?? null
}

export function useLeadActivities(leadId) {
  const { activities } = useData()
  return useMemo(
    () =>
      activities
        .filter((activity) => activity.leadId === leadId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [activities, leadId],
  )
}

export function useUser(id) {
  const { users } = useData()
  return users.find((user) => user.id === id) ?? null
}

export function useUserMap() {
  const { users } = useData()
  return useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
}

export function useCampaignMap() {
  const { campaigns } = useData()
  return useMemo(() => new Map(campaigns.map((c) => [c.id, c])), [campaigns])
}
