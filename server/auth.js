// Autentikasi: kata sandi di-hash dengan scrypt (bawaan Node), sesi memakai JWT.
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { MODULE_ACCESS } from '../src/lib/constants.js'
import { readAll } from './db.js'

const FALLBACK_SECRET = 'vanguard-dev-secret-change-me'
export const JWT_EXPIRES_IN = '12h'

export function jwtSecret() {
  return process.env.JWT_SECRET || FALLBACK_SECRET
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${derived}`
}

export function verifyPassword(password, stored) {
  if (!stored?.startsWith('scrypt$')) return false
  const [, salt, expected] = stored.split('$')
  if (!salt || !expected) return false
  const derived = crypto.scryptSync(password, salt, 64)
  const expectedBuffer = Buffer.from(expected, 'hex')
  return derived.length === expectedBuffer.length && crypto.timingSafeEqual(derived, expectedBuffer)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export async function findUserById(id) {
  const data = await readAll()
  return data.users.find((user) => user.id === id) ?? null
}

// Middleware: wajib token valid dan akun masih aktif.
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Token tidak ditemukan. Silakan masuk kembali.' })

    let payload
    try {
      payload = jwt.verify(token, jwtSecret())
    } catch {
      return res.status(401).json({ error: 'Sesi sudah berakhir. Silakan masuk kembali.' })
    }

    const user = await findUserById(payload.sub)
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Akun tidak aktif atau sudah dihapus.' })
    }

    req.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}

// Middleware: batasi berdasarkan modul. sales hanya boleh menyentuh lead miliknya
// (pengecekan kepemilikan dilakukan di route yang bersangkutan).
export function requireModule(...modules) {
  return (req, res, next) => {
    const role = req.user?.role
    const allowed = modules.some((module) => (MODULE_ACCESS[module] ?? []).includes(role))
    if (!allowed) {
      return res.status(403).json({ error: 'Peran Anda tidak memiliki izin untuk aksi ini.' })
    }
    return next()
  }
}

export function isManager(user) {
  return ['super_admin', 'marketing_manager'].includes(user?.role)
}
