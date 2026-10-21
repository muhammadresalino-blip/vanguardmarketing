import { useState } from 'react'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Badge from '../../components/ui/Badge.jsx'
import { CAMPAIGN_CHANNELS } from '../../lib/constants.js'
import { formatDateTime, formatRelativeTime } from '../../lib/format.js'

const INTEGRATIONS = [
  {
    id: 'email',
    name: 'Email transaksional (Resend / SendGrid)',
    purpose: 'Konfirmasi ke prospek dan notifikasi internal ke sales.',
    status: 'siap',
    note: 'Kredensial API belum diisi pada MVP lokal.',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    purpose: 'Kanal follow-up opsional setelah alur inti stabil.',
    status: 'opsional',
    note: 'Gunakan penyedia resmi dan catat persetujuan komunikasi.',
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    purpose: 'Penarikan biaya iklan untuk perhitungan CPL dan ROAS.',
    status: 'rencana',
    note: 'Terakhir gagal sinkron sekali; sistem menjadwalkan percobaan ulang.',
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    purpose: 'Atribusi lead dari kampanye paid social.',
    status: 'rencana',
    note: 'Fase 3 roadmap: integrasi iklan dan CRM eksternal.',
  },
  {
    id: 'analytics',
    name: 'GA4 / PostHog',
    purpose: 'Trafik dan konversi lanjutan di luar dashboard internal.',
    status: 'opsional',
    note: 'Dashboard internal sudah cukup untuk MVP.',
  },
]

const STATUS_TONE = {
  siap: 'green',
  opsional: 'sky',
  rencana: 'slate',
}

// Nilai waktu diambil sekali di luar render agar tidak memicu re-render tidak stabil.
const FAILURE_LOG = [
  {
    id: 'google_ads',
    at: new Date(Date.now() - 3600000).toISOString(),
    detail: 'token kedaluwarsa, akan dicoba ulang otomatis (percobaan 1/3).',
  },
  {
    id: 'email',
    at: new Date(Date.now() - 26 * 3600000).toISOString(),
    detail: 'email konfirmasi gagal terkirim ke 1 alamat; status disimpan pada lead terkait.',
  },
]

export function Settings() {
  useDocumentTitle('Pengaturan', 'Konfigurasi platform, aturan lead, integrasi, dan data demo.')
  const { settings, updateSettings, resetData, leads, activities, campaigns, posts, users } = useData()
  const userMap = useUserMap()
  const [draft, setDraft] = useState(settings)
  const [savedAt, setSavedAt] = useState(null)

  const handleSave = () => {
    updateSettings(draft)
    setSavedAt(new Date().toISOString())
  }

  const auditLog = [...activities]
    .filter((activity) => ['status_change', 'assignment'].includes(activity.type))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      leads,
      campaigns,
      posts,
      users,
      settings,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vanguard-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Pengaturan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Konfigurasi portal, aturan lead, integrasi, dan pengelolaan data demo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedAt && <span className="text-xs text-accent-600">Tersimpan {formatRelativeTime(savedAt)}</span>}
          <button type="button" className="btn-primary btn-sm" onClick={handleSave}>
            Simpan perubahan
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Identitas & kontak */}
        <section className="card-pad">
          <h2 className="text-base">Identitas perusahaan</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="set-company">
                Nama perusahaan
              </label>
              <input
                id="set-company"
                className="input"
                value={draft.companyName}
                onChange={(event) => setDraft((prev) => ({ ...prev, companyName: event.target.value }))}
              />
            </div>
            <div>
              <label className="label" htmlFor="set-tagline">
                Tagline / positioning
              </label>
              <textarea
                id="set-tagline"
                rows={3}
                className="input"
                value={draft.tagline}
                onChange={(event) => setDraft((prev) => ({ ...prev, tagline: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="set-email">
                  Email publik
                </label>
                <input
                  id="set-email"
                  className="input"
                  value={draft.email}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div>
                <label className="label" htmlFor="set-wa">
                  WhatsApp
                </label>
                <input
                  id="set-wa"
                  className="input"
                  value={draft.whatsapp}
                  onChange={(event) => setDraft((prev) => ({ ...prev, whatsapp: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="set-address">
                Alamat
              </label>
              <input
                id="set-address"
                className="input"
                value={draft.address}
                onChange={(event) => setDraft((prev) => ({ ...prev, address: event.target.value }))}
              />
            </div>
          </div>
        </section>

        {/* Aturan lead */}
        <section className="card-pad">
          <h2 className="text-base">Aturan lead &amp; notifikasi</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="set-target">
                Target waktu respons (menit)
              </label>
              <input
                id="set-target"
                type="number"
                className="input"
                value={draft.leadResponseTargetMinutes}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, leadResponseTargetMinutes: Number(event.target.value) || 0 }))
                }
              />
              <p className="mt-1 text-xs text-slate-500">
                Dipakai untuk menghitung kepatuhan SLA dan menandai lead yang lambat direspons.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="set-dup">
                Aturan pencocokan duplikat
              </label>
              <select
                id="set-dup"
                className="input"
                value={draft.duplicateMatchRules.join(',')}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    duplicateMatchRules: event.target.value.split(','),
                  }))
                }
              >
                <option value="email,phone">Email + nomor telepon</option>
                <option value="email">Hanya email</option>
                <option value="phone">Hanya nomor telepon</option>
                <option value="email,phone,company">Email + telepon + perusahaan</option>
              </select>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={draft.notifySalesOnNewLead}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, notifySalesOnNewLead: event.target.checked }))
                }
              />
              Kirim notifikasi ke sales saat lead baru masuk
            </label>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                checked={draft.sendConfirmationEmail}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, sendConfirmationEmail: event.target.checked }))
                }
              />
              Kirim email konfirmasi otomatis ke prospek
            </label>

            <div>
              <label className="label" htmlFor="set-utm">
                Konvensi UTM
              </label>
              <input
                id="set-utm"
                className="input"
                value={draft.utmConvention}
                onChange={(event) => setDraft((prev) => ({ ...prev, utmConvention: event.target.value }))}
              />
            </div>

            <div>
              <label className="label" htmlFor="set-tz">
                Zona waktu
              </label>
              <select
                id="set-tz"
                className="input"
                value={draft.timezone}
                onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {/* Integrasi */}
      <section className="card-pad">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base">Integrasi</h2>
            <p className="text-sm text-slate-500">
              Prioritas sesuai dokumen: form → CRM → penugasan → notifikasi → pelaporan. Integrasi
              lanjutan menyusul setelah alur inti stabil.
            </p>
          </div>
          <Badge tone="slate">{CAMPAIGN_CHANNELS.length} kanal kampanye didukung</Badge>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-neutral-900">{integration.name}</p>
                <Badge tone={STATUS_TONE[integration.status]}>{integration.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">{integration.purpose}</p>
              <p className="mt-2 text-xs text-slate-500">{integration.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Log kegagalan integrasi</p>
          <ul className="mt-2 space-y-1 text-xs text-amber-800">
            {FAILURE_LOG.map((entry) => (
              <li key={entry.id}>
                {entry.id === 'email' ? 'Email' : 'Google Ads'} · {formatDateTime(entry.at)} · {entry.detail}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        {/* Audit log */}
        <section className="card-pad">
          <h2 className="text-base">Audit log</h2>
          <p className="text-sm text-slate-500">
            Perubahan status dan penugasan dicatat beserta pelakunya.
          </p>
          <ol className="mt-4 space-y-3 text-sm">
            {auditLog.map((activity) => (
              <li key={activity.id} className="border-b border-slate-100 pb-3 last:border-0">
                <p className="text-slate-700">{activity.notes}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {userMap.get(activity.createdBy)?.name ?? 'Sistem'} · {formatDateTime(activity.createdAt)}
                </p>
              </li>
            ))}
            {auditLog.length === 0 && <li className="text-slate-500">Belum ada perubahan tercatat.</li>}
          </ol>
        </section>

        {/* Data */}
        <section className="card-pad">
          <h2 className="text-base">Data &amp; penyimpanan</h2>
          <p className="text-sm text-slate-500">
            MVP ini menyimpan data di localStorage browser sebagai pengganti database PostgreSQL.
          </p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Lead</dt>
              <dd className="font-semibold text-neutral-900">{leads.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Aktivitas</dt>
              <dd className="font-semibold text-neutral-900">{activities.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Kampanye</dt>
              <dd className="font-semibold text-neutral-900">{campaigns.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Artikel</dt>
              <dd className="font-semibold text-neutral-900">{posts.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Pengguna</dt>
              <dd className="font-semibold text-neutral-900">{users.length}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="btn-outline btn-sm" onClick={exportJson}>
              Unduh backup JSON
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm text-red-600"
              onClick={() => {
                if (window.confirm('Reset semua data ke kondisi awal (data contoh)? Perubahan Anda akan hilang.')) {
                  resetData()
                  setDraft(settings)
                }
              }}
            >
              Reset ke data contoh
            </button>
          </div>

          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Untuk produksi: ganti lapisan ini dengan PostgreSQL + Prisma/TypeORM, lalu pindahkan
            autentikasi ke JWT/NextAuth. Struktur tabel yang disarankan sudah tercermin pada model
            data aplikasi (users, pages, posts, campaigns, landingPages, leads, leadActivities,
            deals, tasks, notifications, analyticsEvents, settings).
          </p>
        </section>
      </div>
    </div>
  )
}

export default Settings
