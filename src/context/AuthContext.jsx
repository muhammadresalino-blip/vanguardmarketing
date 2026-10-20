/* oxlint-disable react/only-export-components -- satu file berisi provider + hook pasangannya */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../lib/api.js'
import { DEMO_PASSWORD } from '../lib/seed.js'
import { MODULE_ACCESS } from '../lib/constants.js'
import { useData } from './DataContext.jsx'

const AuthContext = createContext(null)

// Login memakai API: kata sandi diverifikasi di server (scrypt) dan sesi
// disimpan sebagai JWT. Data pengguna tetap diambil dari snapshot agar peran
// dan status terbaru selalu terpakai.
export function AuthProvider({ children }) {
  const { users, refresh } = useData()
  const [session, setSession] = useState(() => api.getSession())

  const user = useMemo(
    () => users.find((u) => u.id === session?.userId && u.status === 'active') ?? null,
    [users, session],
  )

  const login = useCallback(
    async (email, password) => {
      try {
        const result = await api.login(email, password)
        const next = {
          token: result.token,
          userId: result.user.id,
          startedAt: new Date().toISOString(),
        }
        api.saveSession(next)
        setSession(next)
        await refresh()
        return { ok: true, user: result.user }
      } catch (error) {
        return { ok: false, error: error.message }
      }
    },
    [refresh],
  )

  const logout = useCallback(() => {
    api.clearSession()
    setSession(null)
    refresh()
  }, [refresh])

  const can = useCallback(
    (moduleName) => {
      if (!user) return false
      const allowed = MODULE_ACCESS[moduleName]
      return Array.isArray(allowed) ? allowed.includes(user.role) : true
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      can,
      passwordHint: DEMO_PASSWORD,
    }),
    [user, login, logout, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return context
}
