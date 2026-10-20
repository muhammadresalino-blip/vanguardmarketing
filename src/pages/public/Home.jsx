import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { useData } from '../../context/DataContext.jsx'
import LeadForm from '../../components/leads/LeadForm.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { formatDate } from '../../lib/format.js'
import {
  CASE_STUDIES,
  CLIENT_LOGOS,
  COMPANY,
  PROCESS_STEPS,
  SERVICES,
  STATS,
  TESTIMONIALS,
  WHY_US,
} from '../../lib/content.js'

export function Home() {
  useDocumentTitle(
    'Platform Digital Marketing Terpadu',
    COMPANY.tagline,
  )
  const { posts } = useData()
  const latestPosts = [...posts]
    .filter((post) => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 3)

  const featuredCase = CASE_STUDIES[0]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-teal-500 blur-3xl" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-accent-500 blur-3xl" />
        </div>

        <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-white/20">
              Platform portal + marketing + CRM
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Ubah kunjungan menjadi prospek yang benar-benar ditindaklanjuti
            </h1>
            <p className="mt-5 max-w-xl text-base text-navy-100/90">
              {COMPANY.tagline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="btn-accent">
                Konsultasi gratis
              </Link>
              <Link to="/lp/konsultasi-digital-marketing" className="btn-outline border-white/30 bg-white/10 text-white hover:bg-white/20">
                Lihat contoh landing page
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-5 border-t border-white/15 pt-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xl font-bold text-teal-200">{stat.value}</dt>
                  <dd className="mt-1 text-xs text-navy-100/80">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <LeadForm
              headline="Mulai dari satu langkah kecil"
              description="Ceritakan kondisi funnel Anda sekarang. Kami balas dengan langkah perbaikan yang bisa dijalankan minggu ini."
              submitLabel="Kirim & minta audit"
              compact
            />
          </div>
        </div>

        {/* Trusted by */}
        <div className="relative border-t border-white/10 bg-navy-900/60">
          <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-3 py-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-100/60">
              Dipercaya tim pemasaran
            </span>
            {CLIENT_LOGOS.map((logo) => (
              <span key={logo} className="text-sm font-semibold text-navy-100/70">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Layanan</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Satu alur kerja dari form masuk sampai laporan penjualan
            </h2>
            <p className="mt-3 text-slate-600">
              Enam modul yang saling terhubung. Mulai dari yang paling dibutuhkan, tambahkan sisanya
              setelah alur inti stabil.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <article key={service.slug} className="card-pad flex flex-col">
                <span className="text-2xl" aria-hidden="true">
                  {service.icon}
                </span>
                <h3 className="mt-3 text-lg">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{service.summary}</p>
                <p className="mt-4 text-xs text-slate-500">
                  <span className="font-semibold text-navy-700">Cocok untuk: </span>
                  {service.forWho}
                </p>
                <Link to={`/services#${service.slug}`} className="btn-ghost btn-sm mt-4 self-start px-0 text-teal-700">
                  Pelajari detail →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section bg-slate-50">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Kenapa Vanguard</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Pembeda yang kami janjikan — dan buktikan di dashboard
            </h2>
            <p className="mt-3 text-slate-600">
              Kami tidak menjual janji angka. Kami menunjukkan alur kerja yang bisa Anda periksa
              sendiri: sumber lead, waktu respons, dan nilai deal.
            </p>
            <div className="mt-6 rounded-xl border border-navy-100 bg-white p-5">
              <p className="text-sm font-semibold text-navy-900">Alur inti</p>
              <p className="mt-2 text-sm text-slate-600">
                Pengunjung → landing page → form inquiry → lead tersimpan (New) → penugasan otomatis
                ke sales → notifikasi → status diperbarui → dashboard.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_US.map((item) => (
              <div key={item.title} className="card-pad">
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Cara kerja</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Empat tahap, dua sampai tiga minggu</h2>
          </div>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <li key={step.step} className="card-pad">
                <span className="text-sm font-bold text-accent-500">{step.step}</span>
                <h3 className="mt-2 text-base">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Case study */}
      <section className="section bg-navy-900 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Studi kasus</p>
            <h2 className="mt-3 text-2xl text-white sm:text-3xl">{featuredCase.headline}</h2>
            <p className="mt-3 text-sm text-navy-100/85">{featuredCase.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {featuredCase.channels.map((channel) => (
                <span
                  key={channel}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-100"
                >
                  {channel}
                </span>
              ))}
            </div>
            <Link to="/case-studies" className="btn-teal mt-7">
              Lihat semua studi kasus
            </Link>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/15">
            <ul className="space-y-5">
              {featuredCase.metrics.map((metric) => (
                <li key={metric.label}>
                  <p className="text-xs uppercase tracking-wide text-navy-100/60">{metric.label}</p>
                  <p className="mt-1 flex flex-wrap items-baseline gap-2 text-lg font-bold">
                    <span className="text-navy-100/60 line-through">{metric.before}</span>
                    <span className="text-teal-300">{metric.after}</span>
                  </p>
                </li>
              ))}
            </ul>
            <blockquote className="mt-6 border-t border-white/10 pt-5 text-sm italic text-navy-100/85">
              “{featuredCase.quote}”
              <footer className="mt-2 not-italic text-xs text-navy-100/60">— {featuredCase.author}</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Testimoni</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Kata pengguna setelah 90 hari</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure key={item.name} className="card-pad flex flex-col">
                <blockquote className="flex-1 text-sm text-slate-600">“{item.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-navy-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Blog preview */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Blog</p>
              <h2 className="mt-3 text-2xl sm:text-3xl">Panduan praktis untuk tim kecil</h2>
            </div>
            <Link to="/blog" className="btn-outline btn-sm">
              Semua artikel
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <article key={post.id} className="card-pad flex flex-col">
                <Badge tone="teal">{post.category}</Badge>
                <h3 className="mt-3 text-base">
                  <Link to={`/blog/${post.slug}`} className="hover:text-navy-700">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{post.excerpt}</p>
                <p className="mt-4 text-xs text-slate-500">
                  {formatDate(post.publishedAt)} · {post.readMinutes} menit baca
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container-page grid gap-10 rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-50 to-white p-6 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl">Siap menata lead Anda minggu ini?</h2>
            <p className="mt-3 text-slate-600">
              Kami mulai dari yang paling sederhana: satu form, satu daftar lead, satu target waktu
              respons. Setelah itu baru kampanye dan pelaporan.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>✓ Audit funnel gratis, tanpa komitmen kontrak</li>
              <li>✓ Rencana perbaikan 30 hari yang bisa dijalankan tim sendiri</li>
              <li>✓ Contoh dashboard dan laporan yang akan Anda terima</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${COMPANY.whatsapp}`}
                className="btn-teal"
                target="_blank"
                rel="noreferrer"
              >
                Chat WhatsApp
              </a>
              <Link to="/services" className="btn-outline">
                Lihat layanan
              </Link>
            </div>
          </div>

          <LeadForm
            headline="Minta audit funnel"
            description="Satu formulir untuk semua kanal. Kami catat sumber kunjungan Anda secara otomatis."
            submitLabel="Kirim permintaan audit"
            compact
          />
        </div>
      </section>
    </>
  )
}

export default Home
