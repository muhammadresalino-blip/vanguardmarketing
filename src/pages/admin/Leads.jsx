import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData, useCampaignMap, useUserMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import LeadStatusBadge from '../../components/ui/StatusBadges.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_STATUS_VALUES,
  ROLE_LABEL,
} from '../../lib/constants.js'
import {
  downloadCsv,
  formatCompactCurrency,
  formatDate,
  formatPercent,
  toCsv,
} from '../../lib/format.js'

const PAGE_SIZE = 12

const CSV_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telepon' },
  { key: 'company', label: 'Perusahaan' },
  { key: 'source', label: 'Sumber' },
  { key: 'utmCampaign', label: 'Kampanye' },
  { key: 'utmMedium', label: 'UTM Medium' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Pemilik' },
  { key: 'createdAt', label: 'Tanggal Masuk' },
]

export function Leads() {
  useDocumentTitle('CRM Lead', 'Daftar, filter, dan penugasan lead dari semua kanal.')
  const { leads, users, campaigns, updateLeadStatus, assignLead, deleteLead } = useData()
  const { user, can } = useAuth()
  const campaignMap = useCampaignMap()
  const userMap = useUserMap()
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(params.get('status') ?? 'all')
  const [source, setSource] = useState('all')
  const [owner, setOwner] = useState(params.get('owner') ?? 'all')
  const [campaignId, setCampaignId] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignTo, setAssignTo] = useState('')

  const salesReps = users.filter((item) => item.role === 'sales')

  const scoped = useMemo(() => {
    if (user?.role === 'sales') return leads.filter((lead) => lead.assignedTo === user.id)
    if (user?.role === 'support') return leads
    return leads
  }, [leads, user])

  const filtered = useMemo(() => {
    const list = scoped.filter((lead) => {
      const matchesQuery =
        !query.trim() ||
        [lead.name, lead.email, lead.company, lead.phone]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query.trim().toLowerCase()))
      const matchesStatus = status === 'all' || lead.status === status
      const matchesSource = source === 'all' || lead.source === source
      const matchesOwner = owner === 'all' || lead.assignedTo === owner
      const matchesCampaign = campaignId === 'all' || lead.campaignId === campaignId
      return matchesQuery && matchesStatus && matchesSource && matchesOwner && matchesCampaign
    })

    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      response: (a, b) => (a.responseMinutes ?? 9999) - (b.responseMinutes ?? 9999),
      value: (a, b) => (b.budgetEstimate ?? 0) - (a.budgetEstimate ?? 0),
    }
    return list.sort(sorters[sort])
  }, [scoped, query, status, source, owner, campaignId, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const summary = useMemo(() => {
    const qualified = filtered.filter((lead) =>
      ['qualified', 'proposal', 'won'].includes(lead.status),
    ).length
    const responded = filtered.filter((lead) => typeof lead.responseMinutes === 'number')
    return {
      total: filtered.length,
      qualified,
      qualityRate: filtered.length ? (qualified / filtered.length) * 100 : 0,
      avgResponse: responded.length
        ? Math.round(responded.reduce((sum, lead) => sum + lead.responseMinutes, 0) / responded.length)
        : 0,
      unassigned: filtered.filter((lead) => !lead.assignedTo).length,
    }
  }, [filtered])

  const applyStatusFilter = (value) => {
    setStatus(value)
    setPage(1)
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete('status')
    else next.set('status', value)
    setParams(next, { replace: true })
  }

  const resetFilters = () => {
    setQuery('')
    applyStatusFilter('all')
    setSource('all')
    setOwner('all')
    setCampaignId('all')
    const next = new URLSearchParams(params)
    next.delete('owner')
    setParams(next, { replace: true })
  }

  const exportCsv = () => {
    const rows = filtered.map((lead) => ({
      ...lead,
      owner: userMap.get(lead.assignedTo)?.name ?? '',
    }))
    downloadCsv(`vanguard-leads-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, CSV_COLUMNS))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">CRM lead</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.role === 'sales'
              ? 'Lead yang ditugaskan kepada Anda.'
              : 'Semua lead dari form website, landing page kampanye, dan kanal lainnya.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline btn-sm" onClick={exportCsv}>
            Ekspor CSV
          </button>
          <Link to="/admin/pipeline" className="btn-primary btn-sm">
            Lihat pipeline
          </Link>
        </div>
      </div>

      {/* Ringkasan filter */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-pad">
          <p className="text-sm text-slate-500">Lead sesuai filter</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{summary.total}</p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Berkualifikasi</p>
          <p className="mt-1 text-2xl font-bold text-accent-600">
            {summary.qualified}{' '}
            <span className="text-sm font-medium text-slate-400">({formatPercent(summary.qualityRate)})</span>
          </p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Rata-rata respons</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{summary.avgResponse} menit</p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Belum ada pemilik</p>
          <p className="mt-1 text-2xl font-bold text-accent-600">{summary.unassigned}</p>
        </div>
      </div>

      {/* Filter bar */}
      <section className="card-pad">
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="label" htmlFor="lead-search">
              Cari lead
            </label>
            <input
              id="lead-search"
              className="input"
              placeholder="Nama, email, perusahaan, atau telepon"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
            />
          </div>

          <div>
            <label className="label" htmlFor="lead-status">
              Status
            </label>
            <select
              id="lead-status"
              className="input"
              value={status}
              onChange={(event) => applyStatusFilter(event.target.value)}
            >
              <option value="all">Semua status</option>
              {LEAD_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="lead-source">
              Sumber
            </label>
            <select
              id="lead-source"
              className="input"
              value={source}
              onChange={(event) => {
                setSource(event.target.value)
                setPage(1)
              }}
            >
              <option value="all">Semua sumber</option>
              {LEAD_SOURCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="lead-owner">
              Pemilik
            </label>
            <select
              id="lead-owner"
              className="input"
              value={owner}
              onChange={(event) => {
                setOwner(event.target.value)
                setPage(1)
              }}
            >
              <option value="all">Semua sales</option>
              {salesReps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="lead-campaign">
              Kampanye
            </label>
            <select
              id="lead-campaign"
              className="input"
              value={campaignId}
              onChange={(event) => {
                setCampaignId(event.target.value)
                setPage(1)
              }}
            >
              <option value="all">Semua kampanye</option>
              {campaigns.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="lead-sort">
              Urutkan
            </label>
            <select
              id="lead-sort"
              className="input"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Terbaru masuk</option>
              <option value="oldest">Terlama masuk</option>
              <option value="response">Respons terlambat</option>
              <option value="value">Estimasi anggaran terbesar</option>
            </select>
          </div>

          <div className="flex items-end lg:col-span-4">
            <button type="button" className="btn-ghost btn-sm" onClick={resetFilters}>
              Reset semua filter
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyStatusFilter('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === 'all' ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600'
            }`}
          >
            Semua
          </button>
          {LEAD_STATUS_VALUES.map((value) => {
            const meta = LEAD_STATUSES.find((item) => item.value === value)
            const count = scoped.filter((lead) => lead.status === value).length
            return (
              <button
                key={value}
                type="button"
                onClick={() => applyStatusFilter(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  status === value ? 'bg-primary-600 text-white' : 'border border-slate-200 text-slate-600'
                }`}
              >
                {meta?.label} ({count})
              </button>
            )
          })}
        </div>
      </section>

      {/* Table */}
      <section className="card">
        {paginated.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Tidak ada lead yang cocok"
              description="Coba longgarkan filter, atau kirim lead uji coba dari form di portal publik."
              icon="🔎"
              action={
                <Link to="/contact" className="btn-primary btn-sm">
                  Buka form inquiry
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Sumber &amp; kampanye</th>
                    <th>Status</th>
                    <th>Pemilik</th>
                    <th>Nilai estimasi</th>
                    <th>Respons</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lead) => {
                    const ownerUser = userMap.get(lead.assignedTo)
                    const campaign = campaignMap.get(lead.campaignId)
                    const late = lead.responseMinutes && lead.responseMinutes > 60
                    return (
                      <tr key={lead.id}>
                        <td>
                          <Link
                            to={`/admin/leads/${lead.id}`}
                            className="font-semibold text-neutral-800 hover:text-primary-600"
                          >
                            {lead.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {lead.company} · {lead.city}
                          </p>
                          <p className="text-xs text-slate-400">{lead.email}</p>
                        </td>
                        <td>
                          <p className="text-sm">{lead.source}</p>
                          <p className="text-xs text-slate-500">{campaign?.name ?? 'Organik / langsung'}</p>
                          {lead.utmMedium && (
                            <p className="font-mono text-[11px] text-slate-400">medium: {lead.utmMedium}</p>
                          )}
                        </td>
                        <td>
                          <LeadStatusBadge status={lead.status} />
                          <p className="mt-1 text-xs text-slate-500">{formatDate(lead.createdAt)}</p>
                        </td>
                        <td>
                          {ownerUser ? (
                            <div>
                              <p className="text-sm">{ownerUser.name}</p>
                              <p className="text-xs text-slate-500">{ROLE_LABEL[ownerUser.role]}</p>
                            </div>
                          ) : (
                            <Badge tone="accent">Belum ditugaskan</Badge>
                          )}
                        </td>
                        <td className="text-sm">{formatCompactCurrency(lead.budgetEstimate ?? 0)}</td>
                        <td>
                          {lead.responseMinutes ? (
                            <span className={late ? 'text-sm font-semibold text-accent-600' : 'text-sm text-slate-600'}>
                              {lead.responseMinutes} menit
                            </span>
                          ) : (
                            <Badge tone="navy">Menunggu</Badge>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1.5">
                            <select
                              className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                              value={lead.status}
                              onChange={(event) =>
                                updateLeadStatus(lead.id, event.target.value, user?.id, undefined)
                              }
                              aria-label={`Ubah status ${lead.name}`}
                            >
                              {LEAD_STATUSES.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>
                            {can('leads') && (
                              <button
                                type="button"
                                className="btn-outline btn-sm"
                                onClick={() => {
                                  setAssignTarget(lead)
                                  setAssignTo(lead.assignedTo ?? salesReps[0]?.id ?? '')
                                }}
                              >
                                Tugaskan
                              </button>
                            )}
                            {user?.role === 'super_admin' && (
                              <button
                                type="button"
                                className="btn-ghost btn-sm text-red-600"
                                onClick={() => {
                                  if (window.confirm(`Hapus lead ${lead.name}? Tindakan ini tidak bisa dibatalkan.`)) {
                                    deleteLead(lead.id)
                                  }
                                }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm">
              <p className="text-slate-500">
                Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} lead
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  ← Sebelumnya
                </button>
                <span className="text-xs text-slate-500">
                  Halaman {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Modal penugasan */}
      <Modal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title="Tugaskan lead ke sales"
        description={assignTarget ? `${assignTarget.name} · ${assignTarget.company}` : ''}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setAssignTarget(null)}>
              Batal
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (assignTarget && assignTo) assignLead(assignTarget.id, assignTo, user?.id)
                setAssignTarget(null)
              }}
            >
              Simpan penugasan
            </button>
          </>
        }
      >
        <label className="label" htmlFor="assign-select">
          Pilih sales
        </label>
        <select
          id="assign-select"
          className="input"
          value={assignTo}
          onChange={(event) => setAssignTo(event.target.value)}
        >
          <option value="">— pilih sales —</option>
          {salesReps.map((rep) => {
            const load = leads.filter((lead) => lead.assignedTo === rep.id && !['won', 'lost'].includes(lead.status)).length
            return (
              <option key={rep.id} value={rep.id}>
                {rep.name} · {load} lead aktif
              </option>
            )
          })}
        </select>
        <p className="mt-3 text-xs text-slate-500">
          Lead akan menerima notifikasi di panel sales, dan riwayat penugasan tercatat di timeline
          lead.
        </p>
      </Modal>
    </div>
  )
}

export default Leads
