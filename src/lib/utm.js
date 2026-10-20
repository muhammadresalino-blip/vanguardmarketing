// Penangkapan parameter UTM & konteks sumber kunjungan.
// Konteks disimpan per sesi browser sehingga form di landing page campaign
// otomatis tercatat sumbernya di CRM (utm_source, utm_medium, utm_campaign).

import { STORAGE_KEYS, readStore, removeStore, writeStore } from './storage.js'

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'ref',
]

function readParams(search, hash) {
  const params = {}
  const scan = (text) => {
    if (!text) return
    new URLSearchParams(text.replace(/^[?#]/, '')).forEach((value, key) => {
      const lower = key.toLowerCase()
      if (UTM_KEYS.includes(lower) && value) params[lower] = value
    })
  }
  scan(search)
  const hashQuery = hash?.includes('?') ? hash.slice(hash.indexOf('?')) : ''
  scan(hashQuery)
  return params
}

export function captureUtmContext() {
  if (typeof window === 'undefined') return null
  const { search, hash, pathname, referrer } = window.location
  const params = readParams(search, hash)
  const existing = readStore(STORAGE_KEYS.utm, null)

  const hasNewParams = Object.keys(params).length > 0
  if (!hasNewParams && existing?.landingPath) return existing

  const externalReferrer =
    referrer && !referrer.startsWith(window.location.origin) ? referrer : null

  const context = {
    ...params,
    landingPath: hasNewParams || !existing?.landingPath ? pathname : existing.landingPath,
    referrer: externalReferrer ?? existing?.referrer ?? null,
    firstSeenAt: existing?.firstSeenAt ?? new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  }

  writeStore(STORAGE_KEYS.utm, context)
  return context
}

export function getUtmContext() {
  return readStore(STORAGE_KEYS.utm, {})
}

export function clearUtmContext() {
  removeStore(STORAGE_KEYS.utm)
}

// Menerjemahkan konteks UTM menjadi atribut lead yang disimpan di CRM.
export function describeSource(context, fallback = 'Direct') {
  if (!context) return { source: fallback, utmSource: null, utmMedium: null, utmCampaign: null }

  const labelMap = {
    google: 'Google Ads',
    googleads: 'Google Ads',
    adwords: 'Google Ads',
    meta: 'Meta Ads',
    facebook: 'Meta Ads',
    ig: 'Meta Ads',
    instagram: 'Meta Ads',
    linkedin: 'LinkedIn',
    email: 'Email Campaign',
    newsletter: 'Email Campaign',
    referral: 'Referral',
    twitter: 'Social Media',
    tiktok: 'Social Media',
  }

  const rawSource = context.utm_source?.toLowerCase() ?? ''
  const medium = context.utm_medium?.toLowerCase() ?? ''
  let source = labelMap[rawSource]

  if (!source) {
    if (medium === 'cpc' || medium === 'paid_search') source = 'Google Ads'
    else if (medium === 'paid_social') source = 'Social Media'
    else if (medium === 'email') source = 'Email Campaign'
    else if (medium === 'referral') source = 'Referral'
    else if (context.ref || context.referrer) source = 'Referral'
    else if (rawSource) source = 'Social Media'
    else source = fallback
  }

  return {
    source,
    utmSource: context.utm_source ?? null,
    utmMedium: context.utm_medium ?? null,
    utmCampaign: context.utm_campaign ?? null,
  }
}

// Daftar parameter yang perlu ditambahkan ke URL kampanye saat dibagikan.
export function buildCampaignUrl(baseUrl, { source, medium, campaign }) {
  const url = new URL(baseUrl, window.location.origin)
  if (source) url.searchParams.set('utm_source', source)
  if (medium) url.searchParams.set('utm_medium', medium)
  if (campaign) url.searchParams.set('utm_campaign', campaign)
  return url.toString()
}

export function utmSummary(context) {
  if (!context) return 'Tanpa parameter UTM'
  const parts = [
    context.utm_source && `source: ${context.utm_source}`,
    context.utm_medium && `medium: ${context.utm_medium}`,
    context.utm_campaign && `campaign: ${context.utm_campaign}`,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Tanpa parameter UTM'
}
