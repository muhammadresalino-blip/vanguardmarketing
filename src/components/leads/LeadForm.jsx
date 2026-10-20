import { useState } from 'react'
import { useData } from '../../context/DataContext.jsx'
import { describeSource, getUtmContext } from '../../lib/utm.js'
import { isValidEmail, isValidPhone } from '../../lib/format.js'
import { SERVICES } from '../../lib/content.js'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  interest: SERVICES[0].title,
  budgetEstimate: '',
  message: '',
  consent: false,
}

const BUDGET_OPTIONS = [
  { value: 10000000, label: '< Rp10 juta' },
  { value: 25000000, label: 'Rp10–25 juta' },
  { value: 50000000, label: 'Rp25–50 juta' },
  { value: 100000000, label: 'Rp50–100 juta' },
  { value: 250000000, label: '> Rp100 juta' },
]

// Form inquiry dipakai di halaman Kontak maupun landing page campaign.
// Sumber lead diambil otomatis dari parameter UTM di URL.
export function LeadForm({
  campaignId = null,
  landingPageSlug = null,
  sourceOverride = null,
  headline = 'Minta konsultasi & audit funnel',
  description = 'Isi data berikut. Tim kami menghubungi Anda pada jam kerja, umumnya di bawah satu jam.',
  submitLabel = 'Kirim permintaan',
  onSuccess,
  compact = false,
}) {
  const { submitLead, campaigns } = useData()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const campaign = campaigns.find((c) => c.id === campaignId) ?? null

  const setField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 3) next.name = 'Nama minimal 3 karakter.'
    if (!isValidEmail(form.email)) next.email = 'Format email tidak valid.'
    if (!isValidPhone(form.phone)) next.phone = 'Nomor telepon 9–15 digit.'
    if (form.company.trim().length < 2) next.company = 'Nama perusahaan wajib diisi.'
    if (form.message.trim().length < 10) next.message = 'Ceritakan kebutuhan Anda minimal 10 karakter.'
    if (!form.consent) next.consent = 'Persetujuan diperlukan sebelum data dikirim.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    setSubmitError(null)

    const utm = getUtmContext()
    const described = describeSource(utm, sourceOverride ?? 'Direct')

    try {
      const response = await submitLead(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          jobTitle: form.jobTitle.trim() || null,
          city: null,
          source: sourceOverride ?? described.source,
          campaignId,
          utmSource: described.utmSource ?? utm.utm_source ?? null,
          utmMedium: described.utmMedium ?? utm.utm_medium ?? null,
          utmCampaign: described.utmCampaign ?? utm.utm_campaign ?? null,
          landingPage: landingPageSlug,
          message: `${form.interest ? `Minat: ${form.interest}. ` : ''}${form.message.trim()}`,
          budgetEstimate: form.budgetEstimate ? Number(form.budgetEstimate) : null,
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        },
        { channel: campaign ? `landing page ${campaign.name}` : 'form website' },
      )

      if (!response?.lead) {
        throw new Error('Permintaan belum tersimpan. Coba lagi sebentar lagi.')
      }

      setResult({ lead: response.lead, duplicate: response.duplicate })
      setForm(EMPTY)
      onSuccess?.({ lead: response.lead, duplicate: response.duplicate })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="card-pad border-teal-200 bg-teal-50/60">
        <p className="text-sm font-semibold text-teal-800">
          {result.duplicate ? 'Data Anda sudah kami perbarui' : 'Terima kasih, permintaan sudah masuk'}
        </p>
        <p className="mt-2 text-sm text-teal-900/80">
          {result.duplicate
            ? 'Kami menemukan email atau nomor telepon yang sudah terdaftar, jadi data tersebut diperbarui dan tidak dibuat ganda.'
            : `Lead Anda tercatat dengan ID ${result.lead.id} dan status awal New.`}{' '}
          Tim sales akan menghubungi Anda pada jam kerja.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-teal-900/80">
          <li>• Sumber tercatat: {result.lead.source}</li>
          {result.lead.utmCampaign && <li>• Kampanye: {result.lead.utmCampaign}</li>}
          <li>• Estimasi waktu respons tim: &lt; 1 jam</li>
        </ul>
        <button type="button" className="btn-teal btn-sm mt-4" onClick={() => setResult(null)}>
          Kirim permintaan lain
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={compact ? '' : 'card-pad'}>
      <div className="mb-5">
        <h3 className="text-lg font-bold text-navy-900">{headline}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        {campaign && (
          <p className="mt-2 inline-flex rounded-md bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">
            Kampanye: {campaign.name} · {campaign.channel}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="lead-name">
            Nama lengkap *
          </label>
          <input
            id="lead-name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={setField('name')}
            placeholder="Contoh: Andi Pratama"
            autoComplete="name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label className="label" htmlFor="lead-email">
            Email bisnis *
          </label>
          <input
            id="lead-email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={setField('email')}
            placeholder="nama@perusahaan.co.id"
            autoComplete="email"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label className="label" htmlFor="lead-phone">
            Nomor WhatsApp *
          </label>
          <input
            id="lead-phone"
            className={`input ${errors.phone ? 'input-error' : ''}`}
            value={form.phone}
            onChange={setField('phone')}
            placeholder="0812xxxxxxx"
            autoComplete="tel"
          />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>

        <div>
          <label className="label" htmlFor="lead-company">
            Perusahaan *
          </label>
          <input
            id="lead-company"
            className={`input ${errors.company ? 'input-error' : ''}`}
            value={form.company}
            onChange={setField('company')}
            placeholder="Nama perusahaan"
            autoComplete="organization"
          />
          {errors.company && <p className="error-text">{errors.company}</p>}
        </div>

        <div>
          <label className="label" htmlFor="lead-interest">
            Layanan yang diminati
          </label>
          <select id="lead-interest" className="input" value={form.interest} onChange={setField('interest')}>
            {SERVICES.map((service) => (
              <option key={service.slug} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Belum yakin, butuh arahan">Belum yakin, butuh arahan</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="lead-budget">
            Perkiraan anggaran per bulan
          </label>
          <select id="lead-budget" className="input" value={form.budgetEstimate} onChange={setField('budgetEstimate')}>
            <option value="">Belum ditentukan</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="lead-message">
            Kebutuhan Anda *
          </label>
          <textarea
            id="lead-message"
            rows={compact ? 3 : 4}
            className={`input ${errors.message ? 'input-error' : ''}`}
            value={form.message}
            onChange={setField('message')}
            placeholder="Misalnya: kami sudah beriklan di Meta Ads tetapi lead tidak tertata, ingin tahu kanal mana yang paling berkualitas."
          />
          {errors.message && <p className="error-text">{errors.message}</p>}
        </div>
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-navy-700"
          checked={form.consent}
          onChange={setField('consent')}
        />
        <span>
          Saya setuju data ini digunakan untuk menindaklanjuti permintaan saya sesuai{' '}
          <span className="font-medium text-navy-700">kebijakan privasi</span>.
          {errors.consent && <span className="error-text block">{errors.consent}</span>}
        </span>
      </label>

      {submitError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn-accent w-full sm:w-auto" disabled={submitting}>
          {submitting ? 'Mengirim…' : submitLabel}
        </button>
        <p className="text-xs text-slate-500">
          Tanpa biaya. Kami tidak membagikan data Anda ke pihak ketiga.
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Parameter UTM otomatis tersimpan saat formulir dikirim, sehingga sumber kampanye tercatat di CRM.
      </p>
    </form>
  )
}

export default LeadForm
