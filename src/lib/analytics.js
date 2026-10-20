// Perhitungan metrik marketing & sales.
// Semua angka dashboard dihitung dari data mentah (leads, deals, tasks, events)
// supaya laporan tetap konsisten walaupun data diubah dari halaman CRM.

import { LEAD_STATUS_VALUES, PIPELINE_STAGES } from './constants.js'

const DAY_MS = 86400000

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function withinDays(value, days) {
  return Date.now() - new Date(value).getTime() <= days * DAY_MS
}

export function filterLeadsByRange(leads, days) {
  if (!days) return leads
  return leads.filter((lead) => withinDays(lead.createdAt, days))
}

export function summarizeLeads(leads, deals = [], tasks = [], settings = {}) {
  const total = leads.length
  const statusCounts = LEAD_STATUS_VALUES.reduce((acc, status) => {
    acc[status] = leads.filter((l) => l.status === status).length
    return acc
  }, {})

  const contacted = total - statusCounts.new
  const qualified = statusCounts.qualified + statusCounts.proposal + statusCounts.won
  const won = statusCounts.won
  const lost = statusCounts.lost
  const closed = won + lost

  const responders = leads.filter((l) => typeof l.responseMinutes === 'number')
  const avgResponseMinutes = responders.length
    ? Math.round(responders.reduce((sum, l) => sum + l.responseMinutes, 0) / responders.length)
    : 0

  const target = settings.leadResponseTargetMinutes ?? 60
  const withinTarget = responders.filter((l) => l.responseMinutes <= target).length

  const openDeals = deals.filter((d) => !['won', 'lost'].includes(d.stage))
  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedForecast = openDeals.reduce((sum, d) => sum + (d.value * (d.probability ?? 0)) / 100, 0)
  const wonValue = deals.filter((d) => d.stage === 'won').reduce((sum, d) => sum + d.value, 0)

  const openTasks = tasks.filter((t) => t.status === 'open')
  const overdueTasks = openTasks.filter((t) => new Date(t.dueDate).getTime() < Date.now())

  return {
    total,
    statusCounts,
    contacted,
    qualified,
    won,
    lost,
    closed,
    conversionRate: total ? (qualified / total) * 100 : 0,
    winRate: closed ? (won / closed) * 100 : 0,
    contactRate: total ? (contacted / total) * 100 : 0,
    avgResponseMinutes,
    slaCompliance: responders.length ? (withinTarget / responders.length) * 100 : 0,
    responseTargetMinutes: target,
    newLast7Days: leads.filter((l) => withinDays(l.createdAt, 7)).length,
    newPrevious7Days: leads.filter(
      (l) => !withinDays(l.createdAt, 7) && withinDays(l.createdAt, 14),
    ).length,
    pipelineValue,
    weightedForecast,
    wonValue,
    openDeals: openDeals.length,
    openTasks: openTasks.length,
    overdueTasks: overdueTasks.length,
  }
}

export function leadsBySource(leads) {
  const map = new Map()
  leads.forEach((lead) => {
    const entry = map.get(lead.source) ?? { source: lead.source, total: 0, qualified: 0, won: 0 }
    entry.total += 1
    if (['qualified', 'proposal', 'won'].includes(lead.status)) entry.qualified += 1
    if (lead.status === 'won') entry.won += 1
    map.set(lead.source, entry)
  })
  return [...map.values()]
    .map((entry) => ({
      ...entry,
      qualityRate: entry.total ? (entry.qualified / entry.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export function leadsByChannel(campaigns, leads) {
  const campaignById = new Map(campaigns.map((c) => [c.id, c]))
  const map = new Map()
  leads.forEach((lead) => {
    const channel = campaignById.get(lead.campaignId)?.channel ?? 'organic'
    const entry = map.get(channel) ?? { channel, total: 0, qualified: 0, won: 0, spend: 0 }
    entry.total += 1
    if (['qualified', 'proposal', 'won'].includes(lead.status)) entry.qualified += 1
    if (lead.status === 'won') entry.won += 1
    map.set(channel, entry)
  })
  // Biaya iklan per kanal (dipakai untuk CPL & ROAS).
  campaigns.forEach((campaign) => {
    const entry = map.get(campaign.channel)
    if (entry) entry.spend += campaign.spend
  })
  return [...map.values()].map((entry) => ({
    ...entry,
    cpl: entry.total ? entry.spend / entry.total : 0,
    roas: entry.spend ? (entry.won * entry.spend) / entry.total / entry.spend : 0,
  }))
}

export function funnelStages(leads) {
  const order = ['new', 'contacted', 'qualified', 'proposal', 'won']
  const counts = order.map((status) => ({
    status,
    count: leads.filter((l) => l.status === status).length,
  }))
  // Funnel kumulatif: lead yang sudah mencapai tahap tersebut atau lebih jauh.
  const reached = {}
  reached.new = leads.length
  reached.contacted = leads.filter((l) => l.status !== 'new').length
  reached.qualified = leads.filter((l) => ['qualified', 'proposal', 'won'].includes(l.status)).length
  reached.proposal = leads.filter((l) => ['proposal', 'won'].includes(l.status)).length
  reached.won = leads.filter((l) => l.status === 'won').length
  return order.map((status, index) => {
    const value = reached[status]
    const prev = index === 0 ? leads.length : reached[order[index - 1]]
    return {
      status,
      count: counts[index].count,
      reached: value,
      conversionFromPrevious: prev ? (value / prev) * 100 : 0,
      conversionFromStart: leads.length ? (value / leads.length) * 100 : 0,
    }
  })
}

export function leadsTrend(leads, days = 30) {
  const buckets = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = startOfDay(Date.now() - i * DAY_MS)
    buckets.push({ date: day.toISOString(), label: day, total: 0, qualified: 0 })
  }
  const index = new Map(buckets.map((b) => [b.date.slice(0, 10), b]))
  leads.forEach((lead) => {
    const key = new Date(lead.createdAt).toISOString().slice(0, 10)
    const bucket = index.get(key)
    if (!bucket) return
    bucket.total += 1
    if (['qualified', 'proposal', 'won'].includes(lead.status)) bucket.qualified += 1
  })
  return buckets
}

export function campaignPerformance(campaigns, leads, events = []) {
  return campaigns
    .map((campaign) => {
      const campaignLeads = leads.filter((l) => l.campaignId === campaign.id)
      const qualified = campaignLeads.filter((l) =>
        ['qualified', 'proposal', 'won'].includes(l.status),
      ).length
      const won = campaignLeads.filter((l) => l.status === 'won').length
      const campaignEvents = events.filter((e) => e.campaignId === campaign.id)
      const sessions = campaignEvents.filter((e) => e.eventName === 'page_view').length
      const submits = campaignEvents.filter((e) => e.eventName === 'form_submit').length
      const budget = campaign.budget || 0
      const spend = campaign.spend || 0
      return {
        ...campaign,
        leads: campaignLeads.length,
        qualified,
        won,
        sessions,
        submits,
        remainingBudget: Math.max(0, budget - spend),
        budgetUsage: budget ? (spend / budget) * 100 : 0,
        cpl: campaignLeads.length ? spend / campaignLeads.length : 0,
        costPerQualified: qualified ? spend / qualified : 0,
        conversionRate: sessions ? (campaignLeads.length / sessions) * 100 : 0,
      }
    })
    .sort((a, b) => b.leads - a.leads)
}

export function trafficStats(events) {
  const pageViews = events.filter((e) => e.eventName === 'page_view')
  const submits = events.filter((e) => e.eventName === 'form_submit')
  const mobile = pageViews.filter((e) => e.device === 'mobile').length
  const byPage = new Map()
  pageViews.forEach((event) => {
    byPage.set(event.pageUrl, (byPage.get(event.pageUrl) ?? 0) + 1)
  })
  const topPages = [...byPage.entries()]
    .map(([pageUrl, views]) => ({ pageUrl, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  return {
    pageViews: pageViews.length,
    formSubmits: submits.length,
    conversionRate: pageViews.length ? (submits.length / pageViews.length) * 100 : 0,
    mobileShare: pageViews.length ? (mobile / pageViews.length) * 100 : 0,
    avgSessionMinutes: pageViews.length
      ? pageViews.reduce((sum, e) => sum + (e.sessionMinutes ?? 0), 0) / pageViews.length
      : 0,
    topPages,
  }
}

export function salesVelocity(leads) {
  const closed = leads.filter((l) => typeof l.responseMinutes === 'number' && l.responseMinutes > 0)
  const avgResponse = closed.length
    ? closed.reduce((sum, l) => sum + l.responseMinutes, 0) / closed.length
    : 0
  return { avgResponseMinutes: Math.round(avgResponse), sampleSize: closed.length }
}

export function pipelineByStage(deals, leads) {
  const leadById = new Map(leads.map((l) => [l.id, l]))
  return PIPELINE_STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage.value)
    return {
      ...stage,
      deals: stageDeals,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      leadById,
    }
  })
}

export function compareTrend(current, previous) {
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}
