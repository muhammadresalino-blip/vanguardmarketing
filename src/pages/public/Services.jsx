import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ServiceIcon from '../../components/brand/ServiceIcon.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import LeadForm from '../../components/leads/LeadForm.jsx'
import { PROCESS_STEPS, SERVICES, WHY_US } from '../../lib/content.js'

export function Services() {
  useDocumentTitle(
    'Layanan',
    'Enam modul Vanguard Marketing: lead generation, kampanye multi-kanal, UTM, CRM pipeline, automasi email, dan analytics.',
  )

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">Layanan</p>
          <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl">
            Modul yang bisa dipakai satu per satu, bukan paket yang memaksa
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Kami menyarankan mulai dari lead generation dan alur form ke CRM. Setelah itu berjalan,
            tambahkan kampanye, automasi, dan pelaporan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="btn-accent">
              Konsultasi kebutuhan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/case-studies" className="btn-outline">
              Lihat hasilnya
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page space-y-6">
          {SERVICES.map((service, index) => (
            <article
              key={service.slug}
              id={service.slug}
              className="card-pad scroll-mt-24 lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-10"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50" aria-hidden="true">
                    <ServiceIcon name={service.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Modul {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 className="text-xl">{service.title}</h2>
                  </div>
                </div>
                <p className="mt-4 text-slate-600">{service.summary}</p>
                <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <span className="font-semibold text-neutral-800">Untuk siapa: </span>
                  {service.forWho}
                </p>
              </div>

              <div className="mt-6 lg:mt-0">
                <p className="text-sm font-semibold text-neutral-900">Yang Anda dapatkan</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-0.5 text-accent-600" aria-hidden="true">
                        ✓
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="btn-outline btn-sm mt-5">
                  Diskusikan modul ini
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Manfaat</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Kenapa cara ini lebih bertahan lama</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {WHY_US.map((item) => (
              <div key={item.title} className="card-pad">
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Alur kerja</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Proses implementasi</h2>
          </div>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <li key={step.step} className="relative card-pad">
                <span className="text-sm font-bold text-accent-500">{step.step}</span>
                <h3 className="mt-2 text-base">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-neutral-900">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-white">
            <h2 className="text-2xl text-white sm:text-3xl">Butuh rekomendasi modul mana dulu?</h2>
            <p className="mt-3 text-neutral-200/85">
              Isi formulir singkat ini. Kami akan menunjukkan urutan implementasi yang paling masuk
              akal untuk kondisi tim Anda.
            </p>
            <p className="mt-5 text-sm text-neutral-200/70">
              Rata-rata kami membalas di bawah satu jam pada hari kerja.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 sm:p-6">
            <LeadForm
              headline="Minta rekomendasi"
              description="Cukup isi kebutuhan utama Anda, sisanya kami tanyakan saat sesi konsultasi."
              submitLabel="Kirim permintaan"
              compact
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default Services
