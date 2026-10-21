import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Badge from '../../components/ui/Badge.jsx'
import { formatDateTime } from '../../lib/format.js'

export function ThankYou() {
  useDocumentTitle('Terima kasih', 'Permintaan Anda sudah kami terima dan sedang ditindaklanjuti.')

  const [params] = useSearchParams()
  const { leads, campaigns, users } = useData()
  const lead = leads.find((item) => item.id === params.get('lead')) ?? null
  const campaign = campaigns.find((item) => item.id === lead?.campaignId)
  const owner = users.find((user) => user.id === lead?.assignedTo)

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-2xl">
          ✓
        </span>
        <h1 className="mt-5 text-3xl sm:text-4xl">Terima kasih, permintaan Anda sudah masuk</h1>
        <p className="mt-4 text-slate-600">
          Tim kami akan menghubungi Anda pada jam kerja, umumnya di bawah satu jam. Berikut ringkasan
          yang tercatat di sistem kami.
        </p>
      </div>

      {lead ? (
        <div className="mx-auto mt-10 max-w-2xl card-pad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base">Ringkasan lead</h2>
            <Badge tone="navy" dot>
              Status: New
            </Badge>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Nama</dt>
              <dd className="text-sm font-medium text-neutral-900">{lead.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Perusahaan</dt>
              <dd className="text-sm font-medium text-neutral-900">{lead.company}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Email</dt>
              <dd className="text-sm font-medium text-neutral-900">{lead.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Telepon</dt>
              <dd className="text-sm font-medium text-neutral-900">{lead.phone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Sumber lead</dt>
              <dd className="text-sm font-medium text-neutral-900">{lead.source}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Kampanye</dt>
              <dd className="text-sm font-medium text-neutral-900">
                {campaign?.name ?? lead.utmCampaign ?? 'Organik / langsung'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">UTM</dt>
              <dd className="font-mono text-xs text-slate-600">
                {[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Waktu masuk</dt>
              <dd className="text-sm font-medium text-neutral-900">{formatDateTime(lead.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Ditugaskan ke</dt>
              <dd className="text-sm font-medium text-neutral-900">{owner?.name ?? 'Menunggu penugasan'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Target respons</dt>
              <dd className="text-sm font-medium text-neutral-900">&lt; 1 jam</dd>
            </div>
          </dl>

          <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            ID lead Anda: <span className="font-mono">{lead.id}</span>. Simpan ID ini bila perlu
            menanyakan status tindak lanjut.
          </p>
        </div>
      ) : (
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
          Detail lead tidak dapat ditampilkan (mungkin data browser sudah dibersihkan). Namun
          permintaan Anda tetap tercatat bila dikirim dari formulir.
        </p>
      )}

      <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-3">
        <Link to="/" className="btn-outline">
          Kembali ke halaman utama
        </Link>
        <Link to="/blog" className="btn-ghost">
          Baca panduan sambil menunggu
        </Link>
      </div>
    </section>
  )
}

export default ThankYou
