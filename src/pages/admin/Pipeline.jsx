import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { PIPELINE_STAGES } from '../../lib/constants.js'
import { formatCompactCurrency, formatDate, formatPercent } from '../../lib/format.js'

export function Pipeline() {
  useDocumentTitle('Pipeline & Deal', 'Tahap deal, nilai, dan proyeksi pendapatan berbobot.')
  const { deals, leads, updateDealStage } = useData()
  const { user } = useAuth()
  const userMap = useUserMap()

  const leadMap = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads])
  const [ownerFilter, setOwnerFilter] = useState('all')

  const scoped = useMemo(() => {
    let list = deals
    if (user?.role === 'sales') list = list.filter((deal) => deal.ownerId === user.id)
    if (ownerFilter !== 'all') list = list.filter((deal) => deal.ownerId === ownerFilter)
    return list
  }, [deals, user, ownerFilter])

  const columns = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => {
        const stageDeals = scoped.filter((deal) => deal.stage === stage.value)
        return {
          ...stage,
          deals: stageDeals,
          value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
        }
      }),
    [scoped],
  )

  const openDeals = scoped.filter((deal) => !['won', 'lost'].includes(deal.stage))
  const weighted = openDeals.reduce((sum, deal) => sum + (deal.value * deal.probability) / 100, 0)
  const wonValue = scoped.filter((deal) => deal.stage === 'won').reduce((sum, deal) => sum + deal.value, 0)
  const salesReps = [...userMap.values()].filter((item) => item.role === 'sales')

  const moveDeal = (deal, direction) => {
    const order = PIPELINE_STAGES.map((stage) => stage.value)
    const index = order.indexOf(deal.stage)
    const nextIndex = Math.min(order.length - 1, Math.max(0, index + direction))
    if (nextIndex === index) return
    updateDealStage(deal.id, order[nextIndex], user?.id)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Pipeline &amp; deal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Setiap deal berasal dari lead yang sudah naik ke tahap Qualified atau lebih tinggi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-500" htmlFor="pipeline-owner">
            Pemilik:
          </label>
          <select
            id="pipeline-owner"
            className="input w-48"
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
          >
            <option value="all">Semua sales</option>
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-pad">
          <p className="text-sm text-slate-500">Deal terbuka</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{openDeals.length}</p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Nilai pipeline</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {formatCompactCurrency(openDeals.reduce((sum, deal) => sum + deal.value, 0))}
          </p>
        </div>
        <div className="card-pad">
          <p className="text-sm text-slate-500">Proyeksi berbobot</p>
          <p className="mt-1 text-2xl font-bold text-accent-600">{formatCompactCurrency(weighted)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Nilai menang tercatat: {formatCompactCurrency(wonValue)}
          </p>
        </div>
      </div>

      {scoped.length === 0 ? (
        <EmptyState
          title="Belum ada deal di pipeline"
          description="Ubah status lead menjadi Qualified pada halaman CRM untuk membuat deal otomatis."
          icon={<Filter className="h-7 w-7 text-slate-500" />}
          action={
            <Link to="/admin/leads" className="btn-primary btn-sm">
              Buka CRM lead
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          {columns.map((column) => (
            <section key={column.value} className="flex flex-col rounded-xl border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-neutral-900">{column.label}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {column.deals.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCompactCurrency(column.value)} · probabilitas {formatPercent(column.probability, 0)}
                </p>
              </header>

              <ul className="flex-1 space-y-3 p-3">
                {column.deals.map((deal) => {
                  const lead = leadMap.get(deal.leadId)
                  const owner = userMap.get(deal.ownerId)
                  return (
                    <li key={deal.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-neutral-900">{lead?.company ?? deal.dealName}</p>
                      <p className="text-xs text-slate-500">{lead?.name ?? '-'}</p>
                      <p className="mt-2 text-sm font-medium text-neutral-800">
                        {formatCompactCurrency(deal.value)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tutup: {formatDate(deal.expectedCloseDate)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Pemilik: {owner?.name ?? '-'}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => moveDeal(deal, -1)}
                          disabled={column.value === PIPELINE_STAGES[0].value}
                          aria-label="Pindah ke tahap sebelumnya"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => moveDeal(deal, 1)}
                          disabled={column.value === 'lost'}
                          aria-label="Pindah ke tahap berikutnya"
                        >
                          →
                        </button>
                        {column.value !== 'won' && (
                          <button
                            type="button"
                            className="btn-teal btn-sm"
                            onClick={() => updateDealStage(deal.id, 'won', user?.id)}
                          >
                            Menang
                          </button>
                        )}
                        {column.value !== 'lost' && (
                          <button
                            type="button"
                            className="btn-ghost btn-sm text-red-600"
                            onClick={() => updateDealStage(deal.id, 'lost', user?.id)}
                          >
                            Kalah
                          </button>
                        )}
                        {lead && (
                          <Link to={`/admin/leads/${lead.id}`} className="btn-ghost btn-sm px-1 text-accent-600">
                            Detail
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}

                {column.deals.length === 0 && (
                  <li className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                    Kosong
                  </li>
                )}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Memindahkan deal juga memperbarui status lead terkait, sehingga CRM dan pipeline selalu
        sinkron. <Badge tone="slate">Sumber: CRM lead</Badge>
      </p>
    </div>
  )
}

export default Pipeline
