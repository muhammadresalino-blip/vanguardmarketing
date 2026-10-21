import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import StatCard from '../../components/ui/StatCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import LineChart from '../../components/charts/LineChart.jsx'
import DonutChart from '../../components/charts/DonutChart.jsx'
import FunnelChart from '../../components/charts/FunnelChart.jsx'
import LeadStatusBadge from '../../components/ui/StatusBadges.jsx'
import {
  campaignPerformance,
  compareTrend,
  funnelStages,
  leadsBySource,
  leadsTrend,
  summarizeLeads,
  trafficStats,
} from '../../lib/analytics.js'
import { formatCompactCurrency, formatNumber, formatPercent, formatRelativeTime } from '../../lib/format.js'

export function Dashboard() {
  useDocumentTitle('Dashboard', 'Ringkasan lead, kampanye, dan kinerja sales.')
  const { leads, deals, tasks, campaigns, events, settings, landingPages, activities } = useData()
  const { user, can } = useAuth()
  const users = useUserMap()

  const scopedLeads = useMemo(
    () => (user?.role === 'sales' ? leads.filter((lead) => lead.assignedTo === user.id) : leads),
    [leads, user],
  )

  const summary = useMemo(() => summarizeLeads(scopedLeads, deals, tasks, settings), [scopedLeads, deals, tasks, settings])
  const trend = useMemo(() => leadsTrend(scopedLeads, 30), [scopedLeads])
  const bySource = useMemo(() => leadsBySource(scopedLeads), [scopedLeads])
  const funnel = useMemo(() => funnelStages(scopedLeads), [scopedLeads])
  const traffic = useMemo(() => trafficStats(events), [events])
  const performance = useMemo(() => campaignPerformance(campaigns, leads, events), [campaigns, leads, events])

  const trendDelta = compareTrend(summary.newLast7Days, summary.newPrevious7Days)

  const recentLeads = useMemo(
    () =>
      [...scopedLeads]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [scopedLeads],
  )

  const timeline = useMemo(() => {
    const leadIds = new Set(scopedLeads.map((lead) => lead.id))
    return [...activities]
      .filter((activity) => leadIds.has(activity.leadId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  }, [activities, scopedLeads])

  const topCampaigns = performance.slice(0, 5)
  const statusChart = [
    { label: 'New', value: summary.statusCounts.new },
    { label: 'Contacted', value: summary.statusCounts.contacted },
    { label: 'Qualified', value: summary.statusCounts.qualified },
    { label: 'Proposal', value: summary.statusCounts.proposal },
    { label: 'Won', value: summary.statusCounts.won },
    { label: 'Lost', value: summary.statusCounts.lost },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Dashboard marketing & sales</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.role === 'sales'
              ? `Menampilkan lead yang ditugaskan kepada ${user.name}.`
              : 'Ringkasan 30 hari terakhir dari seluruh kanal kampanye.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/leads?status=new" className="btn-primary btn-sm">
            Tinjau lead baru ({summary.statusCounts.new})
          </Link>
          {can('campaigns') && (
            <Link to="/admin/campaigns" className="btn-outline btn-sm">
              Kelola kampanye
            </Link>
          )}
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total lead"
          value={formatNumber(summary.total)}
          trend={trendDelta}
          trendLabel={`${summary.newLast7Days} lead 7 hari terakhir`}
          icon="👥"
        />
        <StatCard
          label="Lead berkualifikasi"
          value={formatNumber(summary.qualified)}
          hint={`${formatPercent(summary.conversionRate)} dari total lead`}
          tone="teal"
          icon="⭐"
        />
        <StatCard
          label="Rata-rata waktu respons"
          value={`${summary.avgResponseMinutes} menit`}
          hint={`${formatPercent(summary.slaCompliance)} sesuai target < ${summary.responseTargetMinutes} menit`}
          tone={summary.avgResponseMinutes <= summary.responseTargetMinutes ? 'green' : 'accent'}
          icon="⏱️"
        />
        <StatCard
          label="Nilai pipeline terbuka"
          value={formatCompactCurrency(summary.pipelineValue)}
          hint={`Proyeksi berbobot ${formatCompactCurrency(summary.weightedForecast)}`}
          tone="accent"
          icon="💰"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="card-pad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base">Tren lead 30 hari</h2>
              <p className="text-sm text-slate-500">
                Garis navy: total lead. Garis putus-putus teal: lead berkualifikasi.
              </p>
            </div>
            <Badge tone="navy">Sumber: form website & landing page</Badge>
          </div>
          <div className="mt-4">
            <LineChart data={trend} />
          </div>
        </section>

        <section className="card-pad">
          <h2 className="text-base">Lead per sumber kanal</h2>
          <p className="text-sm text-slate-500">Memakai atribusi UTM yang tercatat.</p>
          <div className="mt-5">
            <DonutChart data={statusChart} centerLabel="Total lead" />
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="card-pad">
          <h2 className="text-base">Funnel konversi</h2>
          <p className="text-sm text-slate-500">
            Berapa lead yang berhasil melewati tiap tahap pipeline.
          </p>
          <div className="mt-4">
            <FunnelChart stages={funnel} />
          </div>
        </section>

        <section className="card-pad">
          <h2 className="text-base">Kinerja kanal</h2>
          <p className="text-sm text-slate-500">
            Jumlah lead dan kualitasnya per sumber. Biaya per lead dihitung dari realisasi kampanye.
          </p>

          <div className="mt-4 table-wrap">
            <table className="table min-w-[560px]">
              <thead>
                <tr>
                  <th>Sumber</th>
                  <th>Lead</th>
                  <th>Rasio kualitas</th>
                  <th>Menang</th>
                </tr>
              </thead>
              <tbody>
                {bySource.map((source) => (
                  <tr key={source.source}>
                    <td className="font-medium text-neutral-900">{source.source}</td>
                    <td>{formatNumber(source.total)}</td>
                    <td>{formatPercent(source.qualityRate)}</td>
                    <td>{formatNumber(source.won)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Traffic + campaigns */}
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <section className="card-pad">
          <h2 className="text-base">Trafik website</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Page view</dt>
              <dd className="text-xl font-bold text-neutral-900">{formatNumber(traffic.pageViews)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Form terkirim</dt>
              <dd className="text-xl font-bold text-neutral-900">{formatNumber(traffic.formSubmits)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Konversi halaman</dt>
              <dd className="text-xl font-bold text-accent-600">{formatPercent(traffic.conversionRate)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Pengguna mobile</dt>
              <dd className="text-xl font-bold text-neutral-900">{formatPercent(traffic.mobileShare, 0)}</dd>
            </div>
          </dl>

          <p className="mt-5 text-sm font-semibold text-neutral-900">Halaman paling banyak dilihat</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            {traffic.topPages.slice(0, 5).map((page) => (
              <li key={page.pageUrl} className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-xs">{page.pageUrl}</span>
                <span className="font-semibold text-neutral-900">{formatNumber(page.views)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-pad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base">Kampanye teratas</h2>
            {can('campaigns') && (
              <Link to="/admin/campaigns" className="btn-ghost btn-sm px-0 text-accent-600">
                Kelola semua →
              </Link>
            )}
          </div>

          <div className="mt-4 table-wrap">
            <table className="table min-w-[620px]">
              <thead>
                <tr>
                  <th>Kampanye</th>
                  <th>Lead</th>
                  <th>CPL</th>
                  <th>Realisasi</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <p className="font-medium text-neutral-900">{campaign.name}</p>
                      <p className="text-xs text-slate-500">{campaign.channel}</p>
                    </td>
                    <td>{formatNumber(campaign.leads)}</td>
                    <td>{formatCompactCurrency(campaign.cpl)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-primary-600"
                            style={{ width: `${Math.min(100, campaign.budgetUsage)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{formatPercent(campaign.budgetUsage, 0)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Recent leads + timeline */}
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="card-pad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base">Lead terbaru</h2>
            <Link to="/admin/leads" className="btn-ghost btn-sm px-0 text-accent-600">
              Lihat semua lead →
            </Link>
          </div>

          <div className="mt-4 table-wrap">
            <table className="table min-w-[600px]">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Sumber</th>
                  <th>Status</th>
                  <th>Pemilik</th>
                  <th>Masuk</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link to={`/admin/leads/${lead.id}`} className="font-medium text-neutral-800 hover:text-primary-600">
                        {lead.name}
                      </Link>
                      <p className="text-xs text-slate-500">{lead.company}</p>
                    </td>
                    <td className="text-sm">{lead.source}</td>
                    <td>
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="text-sm">{users.get(lead.assignedTo)?.name ?? '-'}</td>
                    <td className="text-xs text-slate-500">{formatRelativeTime(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card-pad">
          <h2 className="text-base">Aktivitas terbaru</h2>
          <p className="text-sm text-slate-500">Catatan telepon, email, meeting, dan perubahan status.</p>

          <ol className="mt-4 space-y-4">
            {timeline.map((activity) => {
              const actor = users.get(activity.createdBy)
              return (
                <li key={activity.id} className="flex gap-3">
                  <Avatar name={actor?.name ?? 'Sistem'} size="sm" tone="teal" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">{activity.notes}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {actor?.name ?? 'Sistem'} · {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
            {timeline.length === 0 && (
              <li className="text-sm text-slate-500">Belum ada aktivitas untuk lead yang Anda kelola.</li>
            )}
          </ol>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-neutral-900">Aksi cepat</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/admin/tasks" className="btn-outline btn-sm">
                Tugas ({summary.openTasks})
              </Link>
              <Link to="/admin/pipeline" className="btn-outline btn-sm">
                Pipeline
              </Link>
              {landingPages[0] && (
                <Link to={`/lp/${landingPages[0].slug}`} className="btn-ghost btn-sm">
                  Pratinjau landing page
                </Link>
              )}
            </div>
            {summary.overdueTasks > 0 && (
              <p className="mt-3 rounded-lg bg-accent-50 p-3 text-xs text-accent-700">
                {summary.overdueTasks} tugas sudah melewati tenggat. Perlu ditindaklanjuti hari ini.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
