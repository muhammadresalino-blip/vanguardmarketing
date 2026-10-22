import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ServiceIcon from '../../components/brand/ServiceIcon.jsx'
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

const WHY_COLORS = ['bg-primary-500', 'bg-accent-500', 'bg-secondary-500']

const PIPELINE_MOCK = [
  { stage: 'Baru', count: 12, tone: 'bg-primary-500' },
  { stage: 'Kualifikasi', count: 8, tone: 'bg-secondary-500' },
  { stage: 'Menang', count: 5, tone: 'bg-accent-500' },
]

export default function Home() {
  useDocumentTitle(`${COMPANY.name} — Platform Digital Marketing Terpadu`)
  const { posts } = useData()
  const latestPosts = [...posts]
    .filter((post) => post.status === 'published')
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 3)
  const featuredCase = CASE_STUDIES[0]

  return (
    <>
      {/* ===== Hero ============================================== */}
      <section className="relative overflow-hidden bg-neutral-50">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-200/50 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-24 top-32 h-96 w-96 rounded-full bg-secondary-200/40 blur-3xl" aria-hidden="true" />

        <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
              {COMPANY.tagline}
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Kembangkan bisnis dengan{' '}
              <span className="text-primary-500">pemasaran yang lebih cerdas</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-neutral-500">
              Satu alur kerja untuk mengumpulkan prospek, menindaklanjuti penjualan, dan memahami
              kinerja kampanye — tanpa spreadsheet yang berantakan.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="btn-primary btn-lg">
                Mulai gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/services" className="btn-outline btn-lg">
                Lihat cara kerja
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {STATS.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-extrabold text-neutral-900">{stat.value}</dt>
                  <dd className="mt-1 text-xs text-neutral-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-pad relative bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-8">
            <LeadForm
              compact
              headline="Minta audit funnel gratis"
              description="Ceritakan kondisi funnel Anda sekarang. Kami balas dengan langkah perbaikan yang bisa dijalankan minggu ini."
              submitLabel="Kirim & minta audit"
            />
          </div>
        </div>

        {/* Logo pelanggan */}
        <div className="border-t border-neutral-100 bg-white/70">
          <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-3 py-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Dipercaya oleh
            </span>
            {CLIENT_LOGOS.map((logo) => (
              <span key={logo} className="text-sm font-semibold text-neutral-400">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Fitur ============================================= */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow">Dashboard overview</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Semua yang dibutuhkan tim marketing</h2>
          <p className="mt-4 max-w-2xl text-neutral-500">
            Lima modul yang saling terhubung, dirancang untuk tim kecil yang ingin tumbuh tanpa
            menambah alat baru.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <article key={service.slug} className="card card-pad flex flex-col">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <ServiceIcon name={service.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm text-neutral-500">{service.summary}</p>
                <Link
                  to={`/services#${service.slug}`}
                  className="mt-4 self-start text-sm font-semibold text-primary-500 hover:text-primary-600"
                >
                  Selengkapnya →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3 kartu nilai (mockup style guide) ================ */}
      <section className="section bg-neutral-50">
        <div className="container-page grid gap-6 lg:grid-cols-3">
          {WHY_US.slice(0, 3).map((item, index) => (
            <article
              key={item.title}
              className={`card-hover flex flex-col justify-between rounded-2xl p-8 text-white ${WHY_COLORS[index]}`}
            >
              <div>
                <h3 className="text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-white/85">{item.body}</p>
              </div>
              <Link
                to="/contact"
                className="mt-8 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                aria-label={item.title}
              >
                →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Proses ============================================ */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow">Cara kerja</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Empat tahap, dua sampai tiga minggu</h2>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step) => (
              <li key={step.step} className="card card-pad">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                  {step.step}
                </span>
                <h3 className="mt-4 text-base">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-500">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Section gelap: studi kasus + kanban =============== */}
      <section className="section bg-neutral-900 text-white">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-400">
              Studi kasus
            </p>
            <h2 className="mt-3 text-3xl text-white sm:text-4xl">{featuredCase.headline}</h2>
            <p className="mt-4 text-sm text-neutral-300">{featuredCase.summary}</p>

            <ul className="mt-8 grid grid-cols-3 gap-4">
              {featuredCase.metrics.slice(0, 3).map((metric) => (
                <li key={metric.label} className="rounded-xl bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="text-neutral-500 line-through">{metric.before}</span>{' '}
                    <span className="font-bold text-accent-400">{metric.after}</span>
                  </p>
                </li>
              ))}
            </ul>

            <blockquote className="mt-8 border-l-2 border-primary-500 pl-4 text-sm italic text-neutral-300">
              “{featuredCase.quote}”
              <footer className="mt-2 not-italic text-xs text-neutral-400">
                {featuredCase.author}
              </footer>
            </blockquote>

            <Link to="/case-studies" className="btn-primary mt-8">
              Lihat semua studi kasus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mock pipeline */}
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-sm font-semibold text-neutral-300">Sales Pipeline</p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {PIPELINE_MOCK.map((column) => (
                <div key={column.stage} className="rounded-xl bg-neutral-900/70 p-3 ring-1 ring-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300">{column.stage}</span>
                    <span className="text-xs text-neutral-500">{column.count}</span>
                  </div>
                  <div className={`mt-3 h-1.5 w-10 rounded-full ${column.tone}`} aria-hidden="true" />
                  <div className="mt-3 space-y-2">
                    <div className="h-12 rounded-lg bg-white/5" />
                    <div className="h-12 rounded-lg bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Testimoni ========================================= */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow">Testimoni</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Kata pengguna setelah 90 hari</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((item) => (
              <figure key={item.name} className="card card-pad flex flex-col">
                <blockquote className="flex-1 text-sm text-neutral-600">“{item.quote}”</blockquote>
                <figcaption className="mt-5 border-t border-neutral-100 pt-4">
                  <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Blog ============================================== */}
      {latestPosts.length > 0 && (
        <section className="section bg-neutral-50">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Blog</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">Panduan praktis untuk tim kecil</h2>
              </div>
              <Link to="/blog" className="btn-outline">
                Semua artikel
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {latestPosts.map((post) => (
                <article key={post.id} className="card card-pad flex flex-col">
                  <Badge tone="teal">{post.category}</Badge>
                  <h3 className="mt-4 text-lg">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary-500">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-neutral-500">{post.excerpt}</p>
                  <p className="mt-4 text-xs text-neutral-400">
                    {formatDate(post.publishedAt)} · {post.readMinutes} menit baca
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA + form ======================================= */}
      <section className="section">
        <div className="container-page rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 py-12 sm:px-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-14 lg:py-16">
          <div className="pt-4">
            <h2 className="text-3xl text-white sm:text-4xl">Siap menata lead Anda minggu ini?</h2>
            <p className="mt-4 max-w-lg text-blue-100">
              Kirim pesan singkat tentang bisnis Anda. Kami balas kurang dari satu jam kerja
              dengan langkah konkret — bukan proposal tebal.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-blue-50">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white">✓</span>
                Respons pertama rata-rata 43 menit
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white">✓</span>
                Audit funnel singkat, tanpa biaya
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white">✓</span>
                Rencana 30 hari yang bisa langsung dijalankan
              </li>
            </ul>
          </div>

          <div className="card-pad bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <LeadForm
              headline="Mulai dari satu langkah kecil"
              description="Ceritakan kondisi funnel Anda sekarang. Kami balas dengan langkah perbaikan yang bisa dijalankan minggu ini."
              submitLabel="Kirim & minta audit"
            />
          </div>
        </div>
      </section>
    </>
  )
}
