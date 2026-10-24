import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock better-sqlite3
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

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
}))

import { formatRupiah, formatNumber, formatPercent } from '../lib/format.js'

describe('Format Utilities', () => {
  describe('formatRupiah', () => {
    it('formats billions correctly', () => {
      expect(formatRupiah(1_500_000_000)).toBe('Rp1.5B')
      expect(formatRupiah(2_000_000_000)).toBe('Rp2B')
    })

    it('formats millions correctly', () => {
      expect(formatRupiah(1_500_000)).toBe('Rp2M')
      expect(formatRupiah(999_999)).toBe('Rp999.999')
    })

    it('formats thousands correctly', () => {
      expect(formatRupiah(1_500)).toBe('Rp1.500')
      expect(formatRupiah(500)).toBe('Rp500')
    })

    it('handles zero', () => {
      expect(formatRupiah(0)).toBe('Rp0')
    })
  })

  describe('formatNumber', () => {
    it('formats with Indonesian locale', () => {
      expect(formatNumber(1500)).toBe('1.500')
      expect(formatNumber(1500000)).toBe('1.500.000')
    })

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatPercent', () => {
    it('formats percentage with one decimal', () => {
      expect(formatPercent(50)).toBe('50.0%')
      expect(formatPercent(33.333)).toBe('33.3%')
      expect(formatPercent(100)).toBe('100.0%')
    })

    it('handles zero', () => {
      expect(formatPercent(0)).toBe('0.0%')
    })
  })
})