import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { useNow } from '../../hooks/useNow.js'
import StatCard from '../../components/ui/StatCard.jsx'
import BarChart from '../../components/charts/BarChart.jsx'
import FunnelChart from '../../components/charts/FunnelChart.jsx'
import LineChart from '../../components/charts/LineChart.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { CHANNEL_LABEL } from '../../lib/constants.js'
import {
  campaignPerformance,
  compareTrend,
  filterLeadsByRange,
  funnelStages,
  leadsByChannel,
  leadsBySource,
  leadsTrend,
  summarizeLeads,
  trafficStats,
} from '../../lib/analytics.js'
import {
  downloadCsv,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  toCsv,
} from '../../lib/format.js'

const RANGES = [
  { value: 7, label: '7 hari' },
  { value: 30, label: '30 hari' },
  { value: 90, label: '90 hari' },
  { value: 0, label: 'Semua' },
]

export function Analytics() {
  useDocumentTitle('Analytics', 'Laporan kanal, konversi, biaya per lead, ROAS, dan funnel penjualan.')
  const { leads, deals, tasks, campaigns, events, settings } = useData()
  const [range, setRange] = useState(30)
  const now = useNow(30000)

  const rangedLeads = useMemo(() => filterLeadsByRange(leads, range), [leads, range])
  const rangedEvents = useMemo(
    () => (range ? events.filter((event) => now - new Date(event.createdAt).getTime() <= range * 86400000) : events),
    [events, range, now],
  )

  const summary = useMemo(() => summarizeLeads(rangedLeads, deals, tasks, settings), [rangedLeads, deals, tasks, settings])
  const previousLeads = useMemo(() => {
    if (!range) return []
    return leads.filter((lead) => {
      const age = now - new Date(lead.createdAt).getTime()
      return age > range * 86400000 && age <= range * 2 * 86400000
    })
  }, [leads, range, now])

  const sourceStats = useMemo(() => leadsBySource(rangedLeads), [rangedLeads])
  const channelStats = useMemo(() => leadsByChannel(campaigns, rangedLeads), [campaigns, rangedLeads])
  const performance = useMemo(() => campaignPerformance(campaigns, rangedLeads, rangedEvents), [campaigns, rangedLeads, rangedEvents])
  const traffic = useMemo(() => trafficStats(rangedEvents), [rangedEvents])
  const funnel = useMemo(() => funnelStages(rangedLeads), [rangedLeads])
  const trend = useMemo(() => leadsTrend(rangedLeads, Math.min(range || 90, 90)), [rangedLeads, range])

  const leadDelta = compareTrend(rangedLeads.length, previousLeads.length)

  const roas = useMemo(
    () =>
      performance.map((campaign) => {
        const revenue = rangedLeads
          .filter((lead) => lead.campaignId === campaign.id && lead.status === 'won')
          .reduce((sum, lead) => sum + (lead.budgetEstimate ?? 0), 0)
        return {
          ...campaign,
          revenue,
          roas: campaign.spend ? revenue / campaign.spend : 0,
        }
      }),
    [performance, rangedLeads],
  )

  const duplicateCandidates = useMemo(() => {
    const seen = new Map()
    const duplicates = []
    leads.forEach((lead) => {
      const key = lead.email.toLowerCase()
      if (seen.has(key)) duplicates.push(lead)
      else seen.set(key, lead)
    })
    return duplicates
  }, [leads])

  const exportReport = () => {
    const rows = sourceStats.map((item) => ({
      Sumber: item.source,
      Lead: item.total,
      'Lead berkualifikasi': item.qualified,
      'Rasio kualitas (%)': Math.round(item.qualityRate),
      Menang: item.won,
    }))
    downloadCsv(
      `vanguard-laporan-kanal-${range || 'all'}hari.csv`,
      toCsv(rows, Object.keys(rows[0] ?? { Sumber: '' }).map((key) => ({ key, label: key }))),
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Analytics &amp; pelaporan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Metrik yang bisa ditindaklanjuti: kualitas lead per kanal, biaya per lead, dan proyeksi
            penjualan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {RANGES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRange(item.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  range === item.value
                    ? 'bg-navy-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn-outline btn-sm" onClick={exportReport}>
            Ekspor laporan
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lead periode ini"
          value={formatNumber(rangedLeads.length)}
          trend={range ? leadDelta : undefined}
          trendLabel={range ? 'dibanding periode sebelumnya' : 'sejak data pertama'}
          icon="👥"
        />
        <StatCard
          label="Konversi ke lead berkualitas"
          value={formatPercent(summary.conversionRate)}
          hint={`${summary.qualified} dari ${summary.total} lead`}
          tone="teal"
          icon="⭐"
        />
        <StatCard
          label="Biaya per lead (semua kanal)"
          value={formatCompactCurrency(
            rangedLeads.length
              ? campaigns.reduce((sum, campaign) => sum + campaign.spend, 0) / rangedLeads.length
              : 0,
          )}
          hint="Realisasi belanja dibagi jumlah lead periode ini"
          tone="accent"
          icon="💸"
        />
        <StatCard
          label="Waktu respons rata-rata"
          value={`${summary.avgResponseMinutes} menit`}
          hint={`${formatPercent(summary.slaCompliance)} lead direspons < ${summary.responseTargetMinutes} menit`}
          tone={summary.avgResponseMinutes <= summary.responseTargetMinutes ? 'green' : 'red'}
          icon="⏱️"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="card-pad">
          <h2 className="text-base">Laporan funnel penjualan</h2>
          <p className="text-sm text-slate-500">
            Dari lead masuk sampai deal menang, termasuk tingkat konversi antar tahap.
          </p>
          <div className="mt-4">
            <FunnelChart stages={funnel} />
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Nilai pipeline terbuka</dt>
              <dd className="text-lg font-bold text-navy-900">{formatCompactCurrency(summary.pipelineValue)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Proyeksi berbobot</dt>
              <dd className="text-lg font-bold text-teal-700">{formatCompactCurrency(summary.weightedForecast)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Nilai menang</dt>
              <dd className="text-lg font-bold text-emerald-700">{formatCompactCurrency(summary.wonValue)}</dd>
            </div>
          </dl>
        </section>

        <section className="card-pad">
          <h2 className="text-base">Trafik &amp; konversi halaman</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Page view</dt>
              <dd className="text-xl font-bold text-navy-900">{formatNumber(traffic.pageViews)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Form terkirim</dt>
              <dd className="text-xl font-bold text-navy-900">{formatNumber(traffic.formSubmits)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Konversi halaman</dt>
              <dd className="text-xl font-bold text-teal-700">{formatPercent(traffic.conversionRate)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Durasi sesi rata-rata</dt>
              <dd className="text-xl font-bold text-navy-900">
                {traffic.avgSessionMinutes.toFixed(1)} menit
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-sm font-semibold text-navy-900">Konversi per halaman</p>
          <div className="mt-2">
            <BarChart
              data={traffic.topPages.map((page) => ({ label: page.pageUrl, total: page.views }))}
              tone="teal"
            />
          </div>
        </section>
      </div>

      <section className="card-pad">
        <h2 className="text-base">Tren lead</h2>
        <p className="text-sm text-slate-500">Jumlah lead harian dan jumlah yang berkualifikasi.</p>
        <div className="mt-4">
          <LineChart data={trend} />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card-pad">
          <h2 className="text-base">Kinerja per sumber</h2>
          <p className="text-sm text-slate-500">
            Menilai kanal dari kualitas lead, bukan hanya jumlahnya.
          </p>
          <div className="mt-4 table-wrap">
            <table className="table min-w-[560px]">
              <thead>
                <tr>
                  <th>Sumber</th>
                  <th>Lead</th>
                  <th>Berkualitas</th>
                  <th>Rasio</th>
                  <th>Menang</th>
                </tr>
              </thead>
              <tbody>
                {sourceStats.map((source) => (
                  <tr key={source.source}>
                    <td className="font-medium text-navy-900">{source.source}</td>
                    <td>{formatNumber(source.total)}</td>
                    <td>{formatNumber(source.qualified)}</td>
                    <td>
                      <Badge tone={source.qualityRate >= 40 ? 'green' : source.qualityRate >= 25 ? 'sky' : 'slate'}>
                        {formatPercent(source.qualityRate)}
                      </Badge>
                    </td>
                    <td>{formatNumber(source.won)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card-pad">
          <h2 className="text-base">Belanja &amp; hasil per kanal</h2>
          <p className="text-sm text-slate-500">
            Biaya per lead dihitung dari realisasi belanja kampanye pada kanal tersebut.
          </p>
          <div className="mt-4 table-wrap">
            <table className="table min-w-[560px]">
              <thead>
                <tr>
                  <th>Kanal</th>
                  <th>Lead</th>
                  <th>Belanja</th>
                  <th>Biaya per lead</th>
                </tr>
              </thead>
              <tbody>
                {channelStats.map((channel) => (
                  <tr key={channel.channel}>
                    <td className="font-medium text-navy-900">
                      {CHANNEL_LABEL[channel.channel] ?? channel.channel}
                    </td>
                    <td>{formatNumber(channel.total)}</td>
                    <td>{formatCompactCurrency(channel.spend)}</td>
                    <td>
                      {channel.cpl ? formatCompactCurrency(channel.cpl) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card-pad">
        <h2 className="text-base">ROAS &amp; ROI per kampanye</h2>
        <p className="text-sm text-slate-500">
          ROAS dihitung dari estimasi nilai deal yang menang dibandingkan realisasi belanja kampanye.
        </p>
        {roas.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Belum ada data kampanye pada periode ini" icon="📊" />
          </div>
        ) : (
          <div className="mt-4 table-wrap">
            <table className="table min-w-[720px]">
              <thead>
                <tr>
                  <th>Kampanye</th>
                  <th>Lead</th>
                  <th>Menang</th>
                  <th>Belanja</th>
                  <th>Estimasi nilai menang</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {roas.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <p className="font-medium text-navy-900">{campaign.name}</p>
                      <p className="text-xs text-slate-500">
                        {CHANNEL_LABEL[campaign.channel] ?? campaign.channel}
                      </p>
                    </td>
                    <td>{formatNumber(campaign.leads)}</td>
                    <td>{formatNumber(campaign.won)}</td>
                    <td>{formatCompactCurrency(campaign.spend)}</td>
                    <td>{formatCompactCurrency(campaign.revenue)}</td>
                    <td>
                      <Badge tone={campaign.roas >= 3 ? 'green' : campaign.roas >= 1 ? 'sky' : 'red'}>
                        {campaign.roas.toFixed(2)}×
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card-pad">
          <h2 className="text-base">Kontrol kualitas data</h2>
          <p className="text-sm text-slate-500">
            Metrik pemeriksaan: duplikat, kelengkapan, dan kegagalan integrasi.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Lead tanpa sumber tercatat</span>
              <span className="font-semibold text-navy-900">
                {leads.filter((lead) => !lead.source).length}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Kandidat duplikat (email sama)</span>
              <span className="font-semibold text-navy-900">{duplicateCandidates.length}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Lead tanpa pemilik</span>
              <span className="font-semibold text-navy-900">
                {leads.filter((lead) => !lead.assignedTo).length}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Lead belum dihubungi (status New)</span>
              <span className="font-semibold text-navy-900">{summary.statusCounts.new}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-slate-600">Tugas melewati tenggat</span>
              <span className="font-semibold text-accent-600">{summary.overdueTasks}</span>
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Aturan pencocokan duplikat saat ini: {settings.duplicateMatchRules.join(', ')}. Kegagalan
            integrasi (email/WhatsApp/ads) dicatat di Pengaturan → Integrasi.
          </p>
        </section>

        <section className="card-pad">
          <h2 className="text-base">Sales velocity</h2>
          <p className="text-sm text-slate-500">
            Waktu dari lead masuk sampai respons pertama, dan sebaran status pipeline.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Respons tercepat</p>
              <p className="text-xl font-bold text-emerald-700">
                {(() => {
                  const times = rangedLeads
                    .map((lead) => lead.responseMinutes)
                    .filter((value) => typeof value === 'number')
                  return times.length ? `${Math.min(...times)} menit` : '—'
                })()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Respons terlama</p>
              <p className="text-xl font-bold text-red-600">
                {(() => {
                  const times = rangedLeads
                    .map((lead) => lead.responseMinutes)
                    .filter((value) => typeof value === 'number')
                  return times.length ? `${Math.max(...times)} menit` : '—'
                })()}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <BarChart
              data={[
                { label: 'New', total: summary.statusCounts.new },
                { label: 'Contacted', total: summary.statusCounts.contacted },
                { label: 'Qualified', total: summary.statusCounts.qualified },
                { label: 'Proposal', total: summary.statusCounts.proposal },
                { label: 'Won', total: summary.statusCounts.won },
                { label: 'Lost', total: summary.statusCounts.lost },
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default Analytics
