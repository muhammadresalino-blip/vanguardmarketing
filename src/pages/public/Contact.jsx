import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import LeadForm from '../../components/leads/LeadForm.jsx'
import { COMPANY, FAQS } from '../../lib/content.js'
import { getUtmContext, utmSummary } from '../../lib/utm.js'

export function Contact() {
  useDocumentTitle(
    'Kontak',
    'Hubungi tim Vanguard Marketing untuk audit funnel, pertanyaan layanan, atau kerja sama. Respons di bawah satu jam pada hari kerja.',
  )

  const utm = getUtmContext()

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">Kontak</p>
          <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl">Ceritakan kebutuhan Anda</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Isi formulir di samping atau hubungi kami langsung lewat WhatsApp. Kami membalas pada jam
            kerja dan mencatat sumber kunjungan Anda otomatis.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <LeadForm
            headline="Form inquiry"
            description="Informasi yang kami minta seminimal mungkin agar mudah diisi dari ponsel."
            submitLabel="Kirim permintaan"
          />

          <div className="space-y-5">
            <div className="card-pad">
              <h2 className="text-base">Kontak langsung</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Kantor</dt>
                  <dd className="font-medium text-neutral-900">{COMPANY.address}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Telepon</dt>
                  <dd className="font-medium text-neutral-900">{COMPANY.phone}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-neutral-900">{COMPANY.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Jam operasional</dt>
                  <dd className="font-medium text-neutral-900">{COMPANY.hours}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${COMPANY.whatsapp}?text=Halo%20Vanguard%20Marketing%2C%20saya%20ingin%20konsultasi`}
                  className="btn-teal btn-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat WhatsApp
                </a>
                <a href={`mailto:${COMPANY.email}`} className="btn-outline btn-sm">
                  Kirim email
                </a>
              </div>
            </div>

            <div className="card-pad">
              <h2 className="text-base">Konteks kunjungan Anda</h2>
              <p className="mt-2 text-sm text-slate-600">
                Parameter ini ikut tersimpan saat formulir dikirim, sehingga laporan kanal tetap
                akurat.
              </p>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                {utmSummary(utm)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Halaman masuk: {utm.landingPath ?? '/'} · Pertama terlihat:{' '}
                {utm.firstSeenAt ? new Date(utm.firstSeenAt).toLocaleString('id-ID') : '-'}
              </p>
            </div>

            <div className="card-pad">
              <h2 className="text-base">Lokasi</h2>
              <div className="mt-3 flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                Peta lokasi kantor (placeholder — siap diisi embed Google Maps)
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Kunjungan kantor dengan janji temu, Senin–Jumat 09.00–18.00 WIB.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Pertanyaan yang sering masuk</h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {FAQS.map((faq) => (
              <details key={faq.question} className="card-pad group">
                <summary className="cursor-pointer list-none text-base font-semibold text-neutral-900">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-14 text-center sm:px-10 lg:py-16">
          <h2 className="text-3xl text-white sm:text-4xl">Siap menata lead Anda minggu ini?</h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Mulai dari satu langkah kecil — kirim pesan singkat, kami balas kurang dari satu jam kerja.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${COMPANY.whatsapp}?text=Halo%20Vanguard%20Marketing%2C%20saya%20ingin%20konsultasi`}
              className="btn-dark"
            >
              Chat WhatsApp
            </a>
            <a href={`mailto:${COMPANY.email}`} className="btn bg-white text-slate-900 shadow-md hover:bg-blue-50">
              Kirim email
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
