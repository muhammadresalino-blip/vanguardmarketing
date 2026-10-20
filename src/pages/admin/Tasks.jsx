import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { useNow } from '../../hooks/useNow.js'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { TASK_TYPES } from '../../lib/constants.js'
import { formatDate, formatDateTime } from '../../lib/format.js'

const TASK_LABEL = TASK_TYPES.reduce((acc, task) => {
  acc[task.value] = task.label
  return acc
}, {})

const TABS = [
  { value: 'open', label: 'Terbuka' },
  { value: 'overdue', label: 'Melewati tenggat' },
  { value: 'done', label: 'Selesai' },
  { value: 'all', label: 'Semua' },
]

export function Tasks() {
  useDocumentTitle('Tugas Follow-up', 'Daftar tugas follow-up lead beserta tenggat dan pemiliknya.')
  const { tasks, leads, users, toggleTask, saveTask } = useData()
  const { user } = useAuth()
  const userMap = useUserMap()

  const [tab, setTab] = useState('open')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ leadId: '', assignedTo: '', type: 'call', dueDate: '', notes: '' })

  const leadMap = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads])
  const salesReps = users.filter((item) => item.role === 'sales')
  const now = useNow()

  const scoped = useMemo(() => {
    let list = tasks
    if (user?.role === 'sales') list = list.filter((task) => task.assignedTo === user.id)
    if (ownerFilter !== 'all') list = list.filter((task) => task.assignedTo === ownerFilter)
    return list
  }, [tasks, user, ownerFilter])

  const isOverdue = (task) => task.status === 'open' && new Date(task.dueDate).getTime() < now

  const counts = useMemo(
    () => ({
      open: scoped.filter((task) => task.status === 'open').length,
      overdue: scoped.filter(isOverdue).length,
      done: scoped.filter((task) => task.status === 'done').length,
      all: scoped.length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoped, now],
  )

  const filtered = useMemo(() => {
    const list = scoped.filter((task) => {
      if (tab === 'open') return task.status === 'open'
      if (tab === 'overdue') return task.status === 'open' && new Date(task.dueDate).getTime() < now
      if (tab === 'done') return task.status === 'done'
      return true
    })
    return list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [scoped, tab, now])

  const handleCreate = () => {
    if (!form.leadId || !form.dueDate) return
    const lead = leadMap.get(form.leadId)
    saveTask({
      leadId: form.leadId,
      assignedTo: form.assignedTo || lead?.assignedTo || user?.id,
      type: form.type,
      dueDate: new Date(form.dueDate).toISOString(),
      notes: form.notes || 'Tugas dibuat manual dari panel.',
      status: 'open',
    })
    setForm({ leadId: '', assignedTo: '', type: 'call', dueDate: '', notes: '' })
    setModalOpen(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Tugas follow-up</h1>
          <p className="mt-1 text-sm text-slate-500">
            Target internal: setiap lead baru disentuh dalam 60 menit, dan tidak ada tugas yang
            terlewat tenggat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-48"
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            aria-label="Filter pemilik tugas"
          >
            <option value="all">Semua pemilik</option>
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn-primary btn-sm" onClick={() => setModalOpen(true)}>
            + Tugas baru
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              tab === item.value
                ? 'bg-navy-700 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label} ({counts[item.value]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas di kategori ini"
          description="Tugas dibuat otomatis saat lead masuk (follow-up awal) atau manual dari halaman lead."
          icon="✅"
        />
      ) : (
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Selesai</th>
                  <th>Tugas</th>
                  <th>Lead</th>
                  <th>Tenggat</th>
                  <th>Pemilik</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const lead = leadMap.get(task.leadId)
                  const overdue = isOverdue(task)
                  return (
                    <tr key={task.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                          checked={task.status === 'done'}
                          onChange={() => toggleTask(task.id)}
                          aria-label="Tandai selesai"
                        />
                      </td>
                      <td>
                        <p className="font-medium text-navy-900">{TASK_LABEL[task.type] ?? task.type}</p>
                        <p className="text-xs text-slate-500">{task.notes}</p>
                      </td>
                      <td>
                        {lead ? (
                          <Link to={`/admin/leads/${lead.id}`} className="text-sm text-navy-800 hover:text-navy-600">
                            {lead.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                        <p className="text-xs text-slate-500">{lead?.company}</p>
                      </td>
                      <td className="text-sm">{formatDate(task.dueDate)}</td>
                      <td className="text-sm">{userMap.get(task.assignedTo)?.name ?? '-'}</td>
                      <td>
                        {task.status === 'done' ? (
                          <Badge tone="green">Selesai</Badge>
                        ) : overdue ? (
                          <Badge tone="red" dot>
                            Melewati tenggat
                          </Badge>
                        ) : (
                          <Badge tone="sky">Terbuka</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat tugas follow-up"
        description="Tugas akan muncul di daftar pemiliknya dan tercatat pada lead terkait."
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={handleCreate} disabled={!form.leadId || !form.dueDate}>
              Simpan tugas
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="task-lead">
              Lead *
            </label>
            <select
              id="task-lead"
              className="input"
              value={form.leadId}
              onChange={(event) => setForm((prev) => ({ ...prev, leadId: event.target.value }))}
            >
              <option value="">— pilih lead —</option>
              {leads
                .filter((lead) => !['won', 'lost'].includes(lead.status))
                .slice(0, 120)
                .map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} · {lead.company}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="task-type">
                Jenis tugas
              </label>
              <select
                id="task-type"
                className="input"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                {TASK_TYPES.map((task) => (
                  <option key={task.value} value={task.value}>
                    {task.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="task-due">
                Tenggat *
              </label>
              <input
                id="task-due"
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="task-owner">
              Pemilik tugas
            </label>
            <select
              id="task-owner"
              className="input"
              value={form.assignedTo}
              onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
            >
              <option value="">Ikuti pemilik lead</option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="task-notes">
              Catatan
            </label>
            <textarea
              id="task-notes"
              rows={3}
              className="input"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Detail singkat yang perlu diingat saat menghubungi prospek."
            />
          </div>

          <p className="text-xs text-slate-500">
            Dibuat: {formatDateTime(now)}
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default Tasks
