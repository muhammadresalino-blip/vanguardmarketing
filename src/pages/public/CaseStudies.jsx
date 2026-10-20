import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Badge from '../../components/ui/Badge.jsx'
import { CASE_STUDIES } from '../../lib/content.js'

export function CaseStudies() {
  useDocumentTitle(
    'Studi Kasus',
    'Hasil proyek Vanguard Marketing pada segmen UMKM, B2B, dan agensi digital, lengkap dengan metrik sebelum dan sesudah.',
  )

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">Studi kasus</p>
          <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl">
            Angka sebelum–sesudah, bukan klaim tanpa dasar
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Tiga contoh dari segmen yang berbeda. Perhatikan bahwa hasilnya bergantung pada kondisi
            awal, anggaran, dan kesiapan tim menindaklanjuti lead.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page space-y-8">
          {CASE_STUDIES.map((study) => (
            <article key={study.slug} id={study.slug} className="card-pad scroll-mt-24">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="navy">{study.industry}</Badge>
                <Badge tone="teal">{study.segment}</Badge>
              </div>

              <h2 className="mt-4 text-xl sm:text-2xl">{study.headline}</h2>
              <p className="mt-3 max-w-3xl text-slate-600">{study.summary}</p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                {study.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-xl bg-slate-50 p-4">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</dt>
                    <dd className="mt-2 flex items-baseline gap-2 text-lg font-bold">
                      <span className="text-slate-400 line-through">{metric.before}</span>
                      <span className="text-teal-700">{metric.after}</span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-navy-900">Kanal yang dipakai</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {study.channels.map((channel) => (
                      <span
                        key={channel}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    Klien: <span className="font-medium text-slate-700">{study.client}</span>
                  </p>
                </div>

                <blockquote className="rounded-xl border-l-4 border-teal-500 bg-teal-50/60 p-5 text-sm text-slate-700">
                  “{study.quote}”
                  <footer className="mt-2 text-xs text-slate-500">{study.author}</footer>
                </blockquote>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section bg-navy-900">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-2xl text-white">Ingin hasil serupa diukur di bisnis Anda?</h2>
            <p className="mt-2 text-navy-100/85">
              Kami mulai dengan menetapkan baseline: sumber lead, waktu respons, dan nilai deal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-accent">
              Mulai dari baseline
            </Link>
            <Link to="/services" className="btn-outline border-white/30 bg-white/10 text-white hover:bg-white/20">
              Lihat layanan
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default CaseStudies
