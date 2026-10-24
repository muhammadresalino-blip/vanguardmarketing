import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { createClient } from 'helmet/dist/middlewares/contentSecurityPolicy.js'
import { body, validationResult } from 'express-validator'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Security middleware configuration
 */

// Rate limiting configurations
export const rateLimiters = {
  // General API rate limit
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Terlalu banyak permintaan, coba lagi nanti' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    message: { error: 'Terlalu banyak percobaan login, coba lagi 15 menit' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // don't count successful requests
  }),

  // Form submission rate limit
  form: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 submissions per hour
    message: { error: 'Terlalu banyak pengiriman form, coba lagi nanti' },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Public API (lead capture) - more lenient
  public: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    message: { error: 'Terlalu banyak permintaan publik' },
  }),
}

/**
 * Helmet CSP configuration
 */
export const cspConfig = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'http://localhost:4000', 'https://*.vanguardmarketing.id'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  },
})

/**
 * Helmet full configuration
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: cspConfig.directives,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  expectCt: { enforce: true, maxAge: 30 },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
})

/**
 * Input sanitization using DOMPurify
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v)
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Express-validator validation chains
 */
export const validators = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Kata sandi minimal 8 karakter')
    .matches(/[A-Z]/).withMessage('Harus mengandung huruf besar')
    .matches(/[a-z]/).withMessage('Harus mengandung huruf kecil')
    .matches(/[0-9]/).withMessage('Harus mengandung angka')
    .matches(/[^A-Za-z0-9]/).withMessage('Harus mengandung simbol'),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama 2-100 karakter')
    .escape(),

  leadName: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage('Nama lead 2-100 karakter'),

  leadEmail: body('email')
    .optional({ nullable: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),

  leadPhone: body('phone')
    .optional({ nullable: true })
    .matches(/^[\d\s\-\+\(\)]{10,20}$/)
    .withMessage('Format telepon tidak valid'),

  leadSource: body('source')
    .optional()
    .isIn(['Direct', 'Email Campaign', 'Google Ads', 'LinkedIn', 'Meta Ads', 'Organic Search', 'Referral', 'Social Media'])
    .withMessage('Sumber tidak valid'),

  leadStatus: body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'])
    .withMessage('Status tidak valid'),

  campaignName: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),

  campaignBudget: body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Anggaran harus angka positif'),

  taskTitle: body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),

  taskDueDate: body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
}

/**
 * Validation error handler middleware
 */
export function handleValidationErrors(req: any, res: any, next: any) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validasi gagal',
      details: errors.array().map(e => ({
        field: e.type === 'field' ? e.path : 'unknown',
        message: e.msg,
      })),
    })
  }
  next()
}

/**
 * Sanitization middleware - applies to all req.body
 */
export function sanitizeBody(req: any, res: any, next: any) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query)
  }
  next()
}

/**
 * Security headers middleware (additional to helmet)
 */
export function additionalSecurityHeaders(req: any, res: any, next: any) {
  // Prevent caching of sensitive pages
  if (req.path.startsWith('/api/') || req.path.startsWith('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  )

  next()
}