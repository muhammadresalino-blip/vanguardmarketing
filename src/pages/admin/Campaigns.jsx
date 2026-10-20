import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData, useCampaignMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { CampaignStatusBadge } from '../../components/ui/StatusBadges.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { CAMPAIGN_CHANNELS, CAMPAIGN_STATUSES, CHANNEL_LABEL } from '../../lib/constants.js'
import { buildCampaignUrl } from '../../lib/utm.js'
import {
  formatCompactCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  toCsv,
  downloadCsv,
} from '../../lib/format.js'
import { campaignPerformance } from '../../lib/analytics.js'

const EMPTY_FORM = {
  id: null,
  name: '',
  channel: 'google_ads',
  status: 'draft',
  budget: 10000000,
  spend: 0,
  landingPageSlug: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
}

export function Campaigns() {
  useDocumentTitle('Kampanye', 'Kelola kampanye per kanal, anggaran, dan tautan UTM.')
  const { campaigns, leads, events, landingPages, saveCampaign, deleteCampaign, saveLandingPage } = useData()
  const { user } = useAuth()
  const campaignMap = useCampaignMap()

  const [form, setForm] = useState(EMPTY_FORM)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const performance = useMemo(() => campaignPerformance(campaigns, leads, events), [campaigns, leads, events])

  const filtered = performance.filter(
    (campaign) => statusFilter === 'all' || campaign.status === statusFilter,
  )

  const totals = useMemo(
    () => ({
      budget: filtered.reduce((sum, campaign) => sum + campaign.budget, 0),
      spend: filtered.reduce((sum, campaign) => sum + campaign.spend, 0),
      leads: filtered.reduce((sum, campaign) => sum + campaign.leads, 0),
      won: filtered.reduce((sum, campaign) => sum + campaign.won, 0),
    }),
    [filtered],
  )

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, landingPageSlug: '' })
    setModalOpen(true)
  }

  const openEdit = (campaign) => {
    setForm({
      id: campaign.id,
      name: campaign.name,
      channel: campaign.channel,
      status: campaign.status,
      budget: campaign.budget,
      spend: campaign.spend,
      landingPageSlug: campaign.landingPageSlug ?? '',
      startDate: campaign.startDate?.slice(0, 10) ?? '',
      endDate: campaign.endDate?.slice(0, 10) ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (form.name.trim().length < 3 || saving) return
    setSaving(true)
    const existingPage = landingPages.find((page) => page.slug === form.landingPageSlug)
    const isNew = !form.id

    const campaignId = await saveCampaign({
      ...form,
      name: form.name.trim(),
      budget: Number(form.budget) || 0,
      spend: Number(form.spend) || 0,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      createdBy: user?.id,
    })

    // Landing page ikut dibuat/diperbarui agar tautan kampanye langsung bisa dibagikan.
    if (campaignId && form.landingPageSlug) {
      await saveLandingPage({
        id: existingPage?.id,
        campaignId: existingPage?.campaignId ?? campaignId,
        slug: form.landingPageSlug,
        title: existingPage?.title ?? `Penawaran: ${form.name}`,
        subtitle:
          existingPage?.subtitle ??
          'Isi formulir singkat ini dan tim kami menghubungi Anda pada jam kerja.',
        offer: existingPage?.offer ?? 'Konsultasi gratis',
        status: form.status === 'active' || !isNew ? 'published' : 'draft',
      })
    }

    setSaving(false)
    setModalOpen(false)
    setForm(EMPTY_FORM)
  }

  const campaignUrl = (campaign) => {
    if (!campaign.landingPageSlug) return null
    const [source, medium] = campaign.channel.split('_')
    return buildCampaignUrl(`${window.location.origin}/lp/${campaign.landingPageSlug}`, {
      source: campaign.channel.includes('meta') ? 'meta' : source,
      medium: medium ?? 'cpc',
      campaign: campaign.name.toLowerCase().replace(/\s+/g, '-').slice(0, 40),
    })
  }

  const exportCsv = () => {
    const rows = filtered.map((campaign) => ({
      Nama: campaign.name,
      Kanal: CHANNEL_LABEL[campaign.channel] ?? campaign.channel,
      Status: campaign.status,
      Anggaran: campaign.budget,
      Realisasi: campaign.spend,
      Lead: campaign.leads,
      'Lead berkualifikasi': campaign.qualified,
      Menang: campaign.won,
      CPL: Math.round(campaign.cpl),
    }))
    const columns = Object.keys(rows[0] ?? { Nama: '' }).map((key) => ({ key, label: key }))
    downloadCsv(`vanguard-kampanye-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, columns))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Kampanye</h1>
          <p className="mt-1 text-sm text-slate-500">
            Anggaran, realisasi belanja, jumlah lead, dan biaya per lead untuk setiap kanal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-40"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter status kampanye"
          >
            <option value="all">Semua status</option>
            {CAMPAIGN_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn-outline btn-sm" onClick={exportCsv}>
            Ekspor CSV
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
            + Kampanye baru
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-pad">
          <p className="text-sm text-slate-500">Total anggaran</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{formatCompactCurrency(totals.budget)}</p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Realisasi belanja</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{formatCompactCurrency(totals.spend)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatPercent(totals.budget ? (totals.spend / totals.budget) * 100 : 0)} dari anggaran
          </p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Lead dari kampanye</p>
          <p className="mt-1 text-2xl font-bold text-teal-700">{formatNumber(totals.leads)}</p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Biaya per lead (rata-rata)</p>
          <p className="mt-1 text-2xl font-bold text-accent-600">
            {formatCompactCurrency(totals.leads ? totals.spend / totals.leads : 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{totals.won} deal menang dari kampanye</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada kampanye"
          description="Tambahkan kampanye pertama untuk mulai melacak sumber lead per kanal."
          icon="📣"
          action={
            <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
              Buat kampanye
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((campaign) => (
            <article key={campaign.id} className="card-pad">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg">{campaign.name}</h2>
                    <CampaignStatusBadge status={campaign.status} />
                    <Badge tone="slate">{CHANNEL_LABEL[campaign.channel] ?? campaign.channel}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(campaign.startDate)} —{' '}
                    {campaign.endDate ? formatDate(campaign.endDate) : 'berjalan'}
                    {campaign.landingPageSlug && (
                      <>
                        {' '}
                        ·{' '}
                        <Link to={`/lp/${campaign.landingPageSlug}`} className="text-teal-700 hover:underline">
                          /lp/{campaign.landingPageSlug}
                        </Link>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {campaignUrl(campaign) && (
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(campaignUrl(campaign))
                        setCopiedId(campaign.id)
                        window.setTimeout(() => setCopiedId(null), 2000)
                      }}
                    >
                      {copiedId === campaign.id ? 'Tautan disalin ✓' : 'Salin tautan UTM'}
                    </button>
                  )}
                  <Link to={`/admin/leads?campaign=${campaign.id}`} className="btn-outline btn-sm">
                    Lihat lead
                  </Link>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => openEdit(campaign)}>
                    Edit
                  </button>
                  {user?.role === 'super_admin' && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm text-red-600"
                      onClick={() => {
                        if (window.confirm(`Hapus kampanye "${campaign.name}"?`)) deleteCampaign(campaign.id)
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Anggaran</dt>
                  <dd className="text-sm font-semibold text-navy-900">{formatCompactCurrency(campaign.budget)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Realisasi</dt>
                  <dd className="text-sm font-semibold text-navy-900">{formatCompactCurrency(campaign.spend)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Lead</dt>
                  <dd className="text-sm font-semibold text-navy-900">{formatNumber(campaign.leads)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Berkualifikasi</dt>
                  <dd className="text-sm font-semibold text-teal-700">{formatNumber(campaign.qualified)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Biaya per lead</dt>
                  <dd className="text-sm font-semibold text-navy-900">{formatCompactCurrency(campaign.cpl)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Biaya per lead berkualitas</dt>
                  <dd className="text-sm font-semibold text-navy-900">
                    {formatCompactCurrency(campaign.costPerQualified)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Pemakaian anggaran</span>
                  <span>{formatPercent(campaign.budgetUsage)}</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      campaign.budgetUsage > 95 ? 'bg-red-500' : campaign.budgetUsage > 75 ? 'bg-accent-500' : 'bg-navy-600'
                    }`}
                    style={{ width: `${Math.min(100, campaign.budgetUsage)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Sisa anggaran: {formatCompactCurrency(campaign.remainingBudget)} · sesi landing page:{' '}
                  {formatNumber(campaign.sessions)} · konversi halaman:{' '}
                  {formatPercent(campaign.conversionRate)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit kampanye' : 'Kampanye baru'}
        description="Kampanye menghubungkan kanal, anggaran, dan landing page dengan lead yang masuk."
        size="lg"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan kampanye'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="cmp-name">
              Nama kampanye *
            </label>
            <input
              id="cmp-name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Misalnya: Google Search — Jasa Digital Marketing"
            />
          </div>

          <div>
            <label className="label" htmlFor="cmp-channel">
              Kanal
            </label>
            <select
              id="cmp-channel"
              className="input"
              value={form.channel}
              onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value }))}
            >
              {CAMPAIGN_CHANNELS.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cmp-status">
              Status
            </label>
            <select
              id="cmp-status"
              className="input"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              {CAMPAIGN_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cmp-budget">
              Anggaran (Rp)
            </label>
            <input
              id="cmp-budget"
              type="number"
              className="input"
              value={form.budget}
              onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="cmp-spend">
              Realisasi belanja (Rp)
            </label>
            <input
              id="cmp-spend"
              type="number"
              className="input"
              value={form.spend}
              onChange={(event) => setForm((prev) => ({ ...prev, spend: event.target.value }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="cmp-start">
              Tanggal mulai
            </label>
            <input
              id="cmp-start"
              type="date"
              className="input"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="cmp-end">
              Tanggal selesai
            </label>
            <input
              id="cmp-end"
              type="date"
              className="input"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="cmp-landing">
              Slug landing page
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">/lp/</span>
              <input
                id="cmp-landing"
                className="input"
                value={form.landingPageSlug}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    landingPageSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  }))
                }
                placeholder="konsultasi-digital-marketing"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Landing page dibuat otomatis bila belum ada. Parameter UTM ditambahkan saat tautan
              dibagikan.
            </p>
          </div>

          {form.landingPageSlug && (
            <div className="sm:col-span-2 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pratinjau tautan ber-UTM
              </p>
              <p className="mt-1 break-all font-mono text-xs text-slate-600">
                {`${window.location.origin}/lp/${form.landingPageSlug}?utm_source=${form.channel.split('_')[0]}&utm_medium=${
                  form.channel.split('_')[1] ?? 'cpc'
                }&utm_campaign=${form.name.toLowerCase().replace(/\s+/g, '-').slice(0, 30) || 'nama-kampanye'}`}
              </p>
            </div>
          )}
        </div>

        {form.id && campaignMap.get(form.id) && (
          <p className="mt-4 text-xs text-slate-500">
            Dibuat {formatDate(campaignMap.get(form.id).createdAt)} · ID {form.id}
          </p>
        )}
      </Modal>
    </div>
  )
}

export default Campaigns
