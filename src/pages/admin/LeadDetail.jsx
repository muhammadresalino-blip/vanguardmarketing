import { useState } from 'react'
import { UserRoundSearch } from 'lucide-react'
import ChannelIcon from '../../components/brand/ChannelIcons.jsx'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData, useCampaignMap, useLead, useLeadActivities, useUserMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { useNow } from '../../hooks/useNow.js'
import LeadStatusBadge from '../../components/ui/StatusBadges.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { ACTIVITY_LABEL, ACTIVITY_TYPES, LEAD_STATUSES, TASK_TYPES } from '../../lib/constants.js'
import {
  formatCompactCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  toWhatsAppNumber,
} from '../../lib/format.js'

const TASK_LABEL = TASK_TYPES.reduce((acc, task) => {
  acc[task.value] = task.label
  return acc
}, {})

export function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lead = useLead(id)
  const activities = useLeadActivities(id)
  const { users, updateLeadStatus, assignLead, addActivity, saveTask, toggleTask, deals, tasks } = useData()
  const { user } = useAuth()
  const campaignMap = useCampaignMap()
  const userMap = useUserMap()

  useDocumentTitle(lead ? `${lead.name} · Lead` : 'Lead tidak ditemukan')

  const [note, setNote] = useState('')
  const now = useNow()
  const [noteType, setNoteType] = useState('call')
  const [followUp, setFollowUp] = useState('')
  const [taskType, setTaskType] = useState('call')

  if (!lead) {
    return (
      <EmptyState
        title="Lead tidak ditemukan"
        description="Lead mungkin sudah dihapus atau tautannya salah."
        action={
          <Link to="/admin/leads" className="btn-primary btn-sm">
            Kembali ke daftar lead
          </Link>
        }
        icon={<UserRoundSearch className="h-7 w-7 text-slate-500" />}
      />
    )
  }

  const campaign = campaignMap.get(lead.campaignId)
  const owner = userMap.get(lead.assignedTo)
  const salesReps = users.filter((item) => item.role === 'sales')
  const leadDeal = deals.find((deal) => deal.leadId === lead.id)
  const leadTasks = tasks.filter((task) => task.leadId === lead.id)
  const late = lead.responseMinutes && lead.responseMinutes > 60

  const handleAddActivity = (event) => {
    event.preventDefault()
    if (note.trim().length < 3) return
    addActivity(lead.id, { type: noteType, notes: note.trim(), createdBy: user?.id ?? 'system' })
    setNote('')
  }

  return (
    <div className="space-y-5">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/admin/leads" className="hover:text-primary-600">
          CRM Lead
        </Link>{' '}
        / <span className="text-slate-600">{lead.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar name={lead.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl">{lead.name}</h1>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {lead.jobTitle ? `${lead.jobTitle} · ` : ''}
              {lead.company}
              {lead.city ? ` · ${lead.city}` : ''}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Masuk {formatDateTime(lead.createdAt)} ({formatRelativeTime(lead.createdAt)})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${lead.email}`} className="btn-outline btn-sm">
            Kirim email
          </a>
          <a
            href={`https://wa.me/${toWhatsAppNumber(lead.phone)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-teal btn-sm"
          >
            WhatsApp
          </a>
          <a href={`tel:${lead.phone}`} className="btn-outline btn-sm">
            Telepon
          </a>
          {user?.role === 'super_admin' && (
            <button
              type="button"
              className="btn-ghost btn-sm text-red-600"
              onClick={() => {
                if (window.confirm('Hapus lead ini beserta riwayatnya?')) navigate('/admin/leads')
              }}
            >
              Arsipkan
            </button>
          )}
        </div>
      </div>

      {/* Peringatan SLA */}
      {!lead.responseMinutes ? (
        <div className="rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-800">
          Lead ini belum tercatat dihubungi. Target internal: respons pertama di bawah 60 menit.
          Tambahkan aktivitas telepon atau email untuk menghentikan pengingat.
        </div>
      ) : (
        late && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Respons pertama tercatat {lead.responseMinutes} menit — melewati target 60 menit.
            Catat penyebabnya agar bisa diperbaiki pada periode berikutnya.
          </div>
        )
      )}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Profil & sumber */}
          <section className="card-pad">
            <h2 className="text-base">Profil &amp; sumber</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
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
                <dd className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                  <ChannelIcon source={lead.source} className="h-4 w-4" />
                  {lead.source}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Kampanye</dt>
                <dd className="text-sm font-medium text-neutral-900">
                  {campaign ? (
                    <Link to="/admin/campaigns" className="hover:text-primary-600">
                      {campaign.name}
                    </Link>
                  ) : (
                    'Organik / langsung'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Landing page</dt>
                <dd className="text-sm font-mono text-slate-600">/{lead.landingPage ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">UTM</dt>
                <dd className="font-mono text-xs text-slate-600">
                  {[lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Estimasi anggaran</dt>
                <dd className="text-sm font-medium text-neutral-900">
                  {formatCompactCurrency(lead.budgetEstimate ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Persetujuan data</dt>
                <dd className="text-sm font-medium text-neutral-900">
                  {lead.consent ? 'Disetujui saat submit' : 'Belum ada'}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pesan dari formulir
              </p>
              <p className="mt-2">{lead.message}</p>
            </div>
          </section>

          {/* Timeline */}
          <section className="card-pad">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base">Timeline aktivitas</h2>
              <Badge tone="slate">{activities.length} catatan</Badge>
            </div>

            <form onSubmit={handleAddActivity} className="mt-4 rounded-xl border border-slate-200 p-4">
              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <div>
                  <label className="label" htmlFor="activity-type">
                    Jenis aktivitas
                  </label>
                  <select
                    id="activity-type"
                    className="input"
                    value={noteType}
                    onChange={(event) => setNoteType(event.target.value)}
                  >
                    {ACTIVITY_TYPES.filter((type) => !['status_change', 'assignment'].includes(type.value)).map(
                      (type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="activity-note">
                    Catatan hasil kontak *
                  </label>
                  <textarea
                    id="activity-note"
                    rows={3}
                    className="input"
                    placeholder="Misalnya: prospek minta proposal untuk paket Growth, follow-up Selasa depan."
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Aktivitas pertama otomatis mencatat waktu respons lead ini.
                </p>
                <button type="submit" className="btn-primary btn-sm">
                  Tambah aktivitas
                </button>
              </div>
            </form>

            <ol className="mt-5 space-y-4 border-l border-slate-200 pl-5">
              {activities.map((activity) => {
                const actor = userMap.get(activity.createdBy)
                const tone =
                  activity.type === 'status_change'
                    ? 'bg-accent-500'
                    : activity.type === 'assignment'
                      ? 'bg-primary-500'
                      : 'bg-slate-400'
                return (
                  <li key={activity.id} className="relative">
                    <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ${tone}`} />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-neutral-800">
                        {ACTIVITY_LABEL[activity.type] ?? activity.type}
                      </span>
                      <span>· {formatDateTime(activity.createdAt)}</span>
                      <span>· {actor?.name ?? 'Sistem'}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{activity.notes}</p>
                  </li>
                )
              })}
              {activities.length === 0 && (
                <li className="text-sm text-slate-500">Belum ada aktivitas tercatat.</li>
              )}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          {/* Status, stage, owner */}
          <section className="card-pad">
            <h2 className="text-base">Status &amp; penugasan</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="lead-status-detail">
                  Status lead
                </label>
                <select
                  id="lead-status-detail"
                  className="input"
                  value={lead.status}
                  onChange={(event) => updateLeadStatus(lead.id, event.target.value, user?.id)}
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Perubahan status tercatat otomatis di timeline.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="lead-owner-detail">
                  Pemilik lead (sales)
                </label>
                <select
                  id="lead-owner-detail"
                  className="input"
                  value={lead.assignedTo ?? ''}
                  onChange={(event) => assignLead(lead.id, event.target.value, user?.id)}
                >
                  <option value="">Belum ditugaskan</option>
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Pemilik saat ini: <span className="font-medium text-slate-700">{owner?.name ?? '-'}</span>
                </p>
              </div>

              <div>
                <label className="label" htmlFor="follow-up">
                  Jadwalkan follow-up
                </label>
                <div className="flex gap-2">
                  <input
                    id="follow-up"
                    type="date"
                    className="input"
                    value={followUp}
                    onChange={(event) => setFollowUp(event.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-outline btn-sm whitespace-nowrap"
                    onClick={() => {
                      if (!followUp) return
                      saveTask({
                        leadId: lead.id,
                        assignedTo: lead.assignedTo ?? user?.id,
                        type: taskType,
                        dueDate: new Date(followUp).toISOString(),
                        notes: 'Follow-up dijadwalkan dari halaman lead.',
                        status: 'open',
                      })
                      setFollowUp('')
                    }}
                  >
                    Tambah tugas
                  </button>
                </div>
                <div className="mt-2">
                  <select
                    className="input"
                    value={taskType}
                    onChange={(event) => setTaskType(event.target.value)}
                    aria-label="Jenis tugas follow-up"
                  >
                    {TASK_TYPES.map((task) => (
                      <option key={task.value} value={task.value}>
                        {task.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Deal */}
          <section className="card-pad">
            <h2 className="text-base">Deal</h2>
            {leadDeal ? (
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Nama deal</dt>
                  <dd className="font-medium text-neutral-900">{leadDeal.dealName}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Nilai</dt>
                  <dd className="font-medium text-neutral-900">{formatCompactCurrency(leadDeal.value)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Tahap &amp; probabilitas</dt>
                  <dd className="font-medium text-neutral-900">
                    {leadDeal.stage} · {leadDeal.probability}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Perkiraan tutup</dt>
                  <dd className="font-medium text-neutral-900">{formatDate(leadDeal.expectedCloseDate)}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Belum ada deal. Deal dibuat otomatis saat status naik ke Qualified atau lebih tinggi.
              </p>
            )}

            <Link to="/admin/pipeline" className="btn-outline btn-sm mt-4">
              Buka pipeline
            </Link>
          </section>

          {/* Tasks */}
          <section className="card-pad">
            <h2 className="text-base">Tugas terkait</h2>
            {leadTasks.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Belum ada tugas untuk lead ini.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {leadTasks.map((task) => {
                  const overdue = task.status === 'open' && new Date(task.dueDate).getTime() < now
                  return (
                    <li key={task.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                        checked={task.status === 'done'}
                        onChange={() => toggleTask(task.id)}
                        aria-label={`Tandai tugas ${TASK_LABEL[task.type]}`}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {TASK_LABEL[task.type] ?? task.type}
                        </p>
                        <p className="text-xs text-slate-500">
                          Tenggat {formatDate(task.dueDate)} · {userMap.get(task.assignedTo)?.name ?? '-'}
                        </p>
                        {overdue && <Badge tone="accent">Melewati tenggat</Badge>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Ringkasan performa lead */}
          <section className="card-pad bg-slate-50">
            <h2 className="text-base">Ringkasan kecepatan</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Masuk</dt>
                <dd className="font-medium text-neutral-900">{formatDateTime(lead.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Kontak pertama</dt>
                <dd className="font-medium text-neutral-900">
                  {lead.contactedAt ? formatDateTime(lead.contactedAt) : 'Belum'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Waktu respons</dt>
                <dd className={`font-medium ${late ? 'text-accent-600' : 'text-neutral-900'}`}>
                  {lead.responseMinutes ? `${lead.responseMinutes} menit` : '-'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Terakhir diperbarui</dt>
                <dd className="font-medium text-neutral-900">{formatRelativeTime(lead.updatedAt)}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default LeadDetail
