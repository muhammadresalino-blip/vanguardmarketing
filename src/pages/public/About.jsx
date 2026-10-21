import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { CASE_STUDIES, CLIENT_LOGOS, COMPANY, STATS } from '../../lib/content.js'

const PRINCIPLES = [
  {
    title: 'Ukur sebelum memperbesar',
    body: 'Kami tidak menambah kanal baru sebelum kanal pertama punya metrik yang jelas dan stabil.',
  },
  {
    title: 'Data prospek adalah milik klien',
    body: 'Data lead disimpan di sistem klien, dengan pencatatan persetujuan dan kebijakan privasi yang jelas.',
  },
  {
    title: 'Otomatisasi mengikuti proses',
    body: 'Alur manual yang rapi lebih baik daripada otomatisasi yang menutupi proses yang kacau.',
  },
]

const TEAM = [
  { name: 'Raka Prasetyo', role: 'Head of Marketing', focus: 'Strategi kanal & pengukuran' },
  { name: 'Maya Anggraini', role: 'Marketing Manager', focus: 'Operasional kampanye' },
  { name: 'Dimas Nugroho', role: 'Senior Sales Executive', focus: 'Pipeline & follow-up' },
  { name: 'Nadia Kusuma', role: 'Content Editor', focus: 'Konten & SEO' },
]

export function About() {
  useDocumentTitle(
    'Tentang Kami',
    'Vanguard Marketing membantu bisnis mengumpulkan prospek, mengelola tindak lanjut penjualan, dan memahami kinerja kampanye dalam satu alur kerja.',
  )

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">Tentang kami</p>
          <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl">
            Kami membangun alur kerja, bukan sekadar brosur digital
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">{COMPANY.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl">Mulai dari masalah yang berulang</h2>
            <div className="mt-5 space-y-4 text-slate-600">
              <p>
                Sebagian besar tim pemasaran yang kami temui punya masalah yang sama: website hanya
                jadi brosur statis, lead tidak terkelola, sumber lead tidak tertrace, dan tim sales
                serta marketing tidak berbagi data yang sama.
              </p>
              <p>
                Akibatnya, anggaran iklan dinilai dari jumlah kunjungan, bukan dari kualitas dan
                hasil penjualan. Kami memulai dengan merapikan hal paling dasar: form yang benar,
                daftar lead yang tunggal, penugasan yang jelas, dan target waktu respons.
              </p>
              <p>
                Setelah alur inti berjalan, barulah otomatisasi, pelaporan lanjutan, dan integrasi
                ditambahkan. Semua diukur dengan metrik yang bisa ditindaklanjuti.
              </p>
            </div>

            <h2 className="mt-12 text-2xl">Prinsip kerja</h2>
            <div className="mt-5 space-y-4">
              {PRINCIPLES.map((principle) => (
                <div key={principle.title} className="rounded-xl border border-slate-200 p-5">
                  <h3 className="text-base">{principle.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{principle.body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card-pad">
              <h3 className="text-base">Ringkasan operasional</h3>
              <dl className="mt-4 space-y-4">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</dt>
                    <dd className="text-xl font-bold text-neutral-900">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card-pad">
              <h3 className="text-base">Tim inti</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {TEAM.map((member) => (
                  <li key={member.name} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-neutral-900">{member.name}</p>
                      <p className="text-slate-500">{member.role}</p>
                    </div>
                    <span className="text-right text-xs text-slate-500">{member.focus}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-pad bg-primary-50">
              <h3 className="text-base">Alamat & kontak</h3>
              <p className="mt-3 text-sm text-slate-600">{COMPANY.address}</p>
              <p className="mt-1 text-sm text-slate-600">{COMPANY.phone}</p>
              <p className="mt-1 text-sm text-slate-600">{COMPANY.email}</p>
              <Link to="/contact" className="btn-primary btn-sm mt-4">
                Hubungi tim
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Klien</p>
              <h2 className="mt-3 text-2xl">Beberapa tim yang memakai alur ini</h2>
            </div>
            <Link to="/case-studies" className="btn-outline btn-sm">
              Lihat studi kasus
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CLIENT_LOGOS.map((logo) => (
              <div
                key={logo}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm font-semibold text-slate-500"
              >
                {logo}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Total {CASE_STUDIES.length} studi kasus dengan angka sebelum–sesudah yang bisa diperiksa.
          </p>
        </div>
      </section>
    </>
  )
}

export default About
