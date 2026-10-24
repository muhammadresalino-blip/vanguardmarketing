import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock better-sqlite3 before importing auth
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      prepare: vi.fn().mockReturnValue({
        run: vi.fn(),
        get: vi.fn(),
        all: vi.fn(),
      }),
      exec: vi.fn(),
      close: vi.fn(),
    })),
  }
})

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
}))

import { jwtSecret, signToken, hashPassword, verifyPassword } from '../../server/auth.js'

describe('Auth Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    delete process.env.JWT_SECRET
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('jwtSecret', () => {
    it('returns fallback secret when JWT_SECRET not set', () => {
      const secret = jwtSecret()
      expect(secret).toBe('vanguard-dev-secret-change-me')
    })

    it('returns JWT_SECRET from env when set', async () => {
      process.env.JWT_SECRET = 'custom-secret-key-123'
      vi.resetModules()
      const { jwtSecret: newJwtSecret } = await import('../../server/auth.js')
      expect(newJwtSecret()).toBe('custom-secret-key-123')
    })
  })

  describe('hashPassword & verifyPassword', () => {
    it('hashes and verifies password correctly', async () => {
      const password = 'test-password-123'
      const hash = await hashPassword(password)

      expect(hash).not.toBe(password)
      expect(hash).toContain('$') // scrypt format

      const valid = await verifyPassword(password, hash)
      expect(valid).toBe(true)

      const invalid = await verifyPassword('wrong-password', hash)
      expect(invalid).toBe(false)
    })

    it('produces different hashes for same password', async () => {
      const password = 'same-password'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
      expect(await verifyPassword(password, hash1)).toBe(true)
      expect(await verifyPassword(password, hash2)).toBe(true)
    })
  })

  describe('signToken', () => {
    const testUser = { id: 'user-1', email: 'test@example.com', role: 'admin' }

    it('signs token with correct payload', async () => {
      const token = await signToken(testUser)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT format

      // Decode payload (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]))
      expect(payload.sub).toBe(testUser.id)
      expect(payload.email).toBe(testUser.email)
      expect(payload.role).toBe(testUser.role)
    })

    it('includes expiry in token', async () => {
      const token = await signToken(testUser)
      const payload = JSON.parse(atob(token.split('.')[1]))
      expect(payload.exp).toBeDefined()
      expect(payload.exp - Math.floor(Date.now() / 1000)).toBeLessThanOrEqual(12 * 60 * 60 + 60) // ~12h
    })

    it('signs with different secrets when env changes', async () => {
      process.env.JWT_SECRET = 'secret-1'
      vi.resetModules()
      const { signToken: sign1 } = await import('../../server/auth.js')

      const token = await sign1(testUser)

      process.env.JWT_SECRET = 'secret-2'
      vi.resetModules()
      const { signToken: sign2 } = await import('../../server/auth.js')

      const token2 = await sign2(testUser)

      // Tokens signed with different secrets should be different
      // (extremely unlikely to collide)
      expect(token).not.toBe(token2)
    })
  })
})