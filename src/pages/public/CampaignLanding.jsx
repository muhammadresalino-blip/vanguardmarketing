import { useEffect, useRef } from 'react'
import { Link2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import LeadForm from '../../components/leads/LeadForm.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { CHANNEL_LABEL } from '../../lib/constants.js'
import { FAQS, TESTIMONIALS, WHY_US } from '../../lib/content.js'
import { getUtmContext } from '../../lib/utm.js'

export function CampaignLanding() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { landingPages, campaigns, logEvent } = useData()

  const page = landingPages.find((item) => item.slug === slug)
  const campaign = campaigns.find((item) => item.id === page?.campaignId) ?? null

  useDocumentTitle(page?.title ?? 'Landing page', page?.subtitle)

  // Catat kunjungan landing page (sekali per mount) untuk laporan kanal.
  const logged = useRef(false)
  useEffect(() => {
    if (!page || logged.current) return
    logged.current = true
    const utm = getUtmContext()
    logEvent({
      eventName: 'page_view',
      campaignId: page.campaignId,
      source: campaign ? CHANNEL_LABEL[campaign.channel] : 'Direct',
      pageUrl: `/lp/${page.slug}`,
      utmSource: utm.utm_source ?? null,
      utmMedium: utm.utm_medium ?? null,
      sessionMinutes: 1,
    })
  }, [page, campaign, logEvent])

  if (!page) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Landing page tidak ditemukan"
          description="Halaman kampanye ini sudah tidak aktif atau tautannya salah."
          icon={<Link2 className="h-7 w-7 text-slate-500" />}
          action={
            <Link to="/" className="btn-primary btn-sm">
              Kembali ke halaman utama
            </Link>
          }
        />
      </div>
    )
  }

  const utm = getUtmContext()

  return (
    <>
      {/* Hero banner */}
      <section className="bg-neutral-900 text-white">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent-200 ring-1 ring-inset ring-white/20">
                {campaign ? CHANNEL_LABEL[campaign.channel] : 'Kampanye'}
              </span>
              {campaign && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-200">
                  {campaign.name}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-xl text-neutral-200/90">{page.subtitle}</p>

            <ul className="mt-6 space-y-2 text-sm text-neutral-200/85">
              <li>✓ Tanpa biaya, tanpa komitmen kontrak</li>
              <li>✓ Dibalas tim manusia, bukan bot</li>
              <li>✓ Estimasi waktu respons &lt; 1 jam pada hari kerja</li>
            </ul>

            <a href="#form" className="btn-accent mt-7">
              {page.offer ?? 'Isi formulir sekarang'}
            </a>

            {utm.utm_source && (
              <p className="mt-4 font-mono text-xs text-neutral-200/60">
                Kunjungan tercatat: {utm.utm_source}
                {utm.utm_medium ? ` / ${utm.utm_medium}` : ''}
                {utm.utm_campaign ? ` / ${utm.utm_campaign}` : ''}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <LeadForm
              campaignId={page.campaignId}
              landingPageSlug={page.slug}
              sourceOverride={undefined}
              headline={page.offer ?? 'Ambil penawaran ini'}
              description="Data Anda hanya dipakai untuk menindaklanjuti permintaan ini."
              submitLabel="Kirim & klaim penawaran"
              compact
              onSuccess={({ lead }) => navigate(`/thank-you?lead=${lead.id}`)}
            />
          </div>
        </div>
      </section>

      {/* USP / benefit */}
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Apa yang Anda dapat</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              Bukan teori — ini yang kami siapkan untuk Anda
            </h2>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li>✓ Ringkasan perbaikan funnel berdasarkan data kampanye Anda</li>
              <li>✓ Contoh alur form → CRM → penugasan sales yang siap dicoba</li>
              <li>✓ Target metrik 30 hari: waktu respons, kualitas lead, dan biaya per lead</li>
            </ul>
            <a href="#form" className="btn-primary mt-7">
              Isi formulir di atas
            </a>
          </div>

          <div className="space-y-4">
            {page.sections.map((section) => (
              <div key={section.title} className="card-pad">
                <h3 className="text-base">{section.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{section.body}</p>
              </div>
            ))}
            {WHY_US.slice(0, 2).map((item) => (
              <div key={item.title} className="card-pad bg-slate-50">
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Bukti sosial</p>
              <h2 className="mt-3 text-2xl">Hasil yang bisa diperiksa</h2>
            </div>
            <Link to="/case-studies" className="btn-outline btn-sm">
              Semua studi kasus
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure key={item.name} className="card-pad">
                <Badge tone="teal">Pengguna aktif</Badge>
                <blockquote className="mt-3 text-sm text-slate-600">“{item.quote}”</blockquote>
                <figcaption className="mt-4 text-xs text-slate-500">
                  <span className="font-semibold text-neutral-900">{item.name}</span> · {item.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Pertanyaan sebelum mengisi form</h2>
            <p className="mt-3 text-sm text-slate-600">
              Belum menemukan jawabannya? Tulis pertanyaan Anda di kolom “Kebutuhan Anda” pada
              formulir.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.slice(0, 4).map((faq) => (
              <details key={faq.question} className="card-pad">
                <summary className="cursor-pointer list-none font-semibold text-neutral-900">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final + form */}
      <section id="form" className="section scroll-mt-20 bg-neutral-900">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-white">
            <h2 className="text-2xl text-white sm:text-3xl">Satu formulir, tindak lanjut jelas</h2>
            <p className="mt-3 text-neutral-200/85">
              Setelah dikirim, lead Anda masuk ke CRM dengan status New dan langsung ditugaskan ke
              sales. Anda akan menerima konfirmasi, dan tim kami menghubungi Anda pada jam kerja.
            </p>
            <ol className="mt-6 space-y-2 text-sm text-neutral-200/80">
              <li>1. Form dikirim &amp; data divalidasi</li>
              <li>2. Lead tersimpan dengan sumber kampanye</li>
              <li>3. Sales dihubungi lewat notifikasi internal</li>
              <li>4. Anda dihubungi untuk langkah berikutnya</li>
            </ol>
          </div>

          <div className="rounded-2xl bg-white p-5 sm:p-6">
            <LeadForm
              campaignId={page.campaignId}
              landingPageSlug={page.slug}
              headline={page.offer ?? 'Isi formulir'}
              description="Kami hanya meminta data yang benar-benar diperlukan."
              submitLabel="Kirim & klaim penawaran"
              compact
              onSuccess={({ lead }) => navigate(`/thank-you?lead=${lead.id}`)}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default CampaignLanding
