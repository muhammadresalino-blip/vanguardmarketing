import { useState } from 'react'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { MODULE_ACCESS, ROLES, ROLE_LABEL } from '../../lib/constants.js'
import { formatDate, formatRelativeTime } from '../../lib/format.js'

const EMPTY_USER = {
  id: null,
  name: '',
  email: '',
  role: 'sales',
  jobTitle: '',
  phone: '',
  status: 'active',
  password: '',
}

const MODULES = Object.keys(MODULE_ACCESS)

export function Users() {
  useDocumentTitle('User & Role', 'Kelola pengguna platform dan hak akses per peran.')
  const { users, leads, saveUser } = useData()
  useUserMap()
  const [form, setForm] = useState(EMPTY_USER)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const openCreate = () => {
    setForm(EMPTY_USER)
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle ?? '',
      phone: user.phone ?? '',
      status: user.status,
      password: '',
    })
    setError(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (form.name.trim().length < 3 || !form.email.includes('@') || saving) return
    if (form.password && form.password.length < 6) {
      setError('Kata sandi minimal 6 karakter.')
      return
    }

    setSaving(true)
    setError(null)
    const payload = { ...form, name: form.name.trim(), email: form.email.trim() }
    if (!payload.password) delete payload.password
    const result = await saveUser(payload)
    setSaving(false)
    if (!result) {
      setError('Gagal menyimpan pengguna. Periksa email dan coba lagi.')
      return
    }
    setModalOpen(false)
    setForm(EMPTY_USER)
  }

  const workload = (userId) =>
    leads.filter((lead) => lead.assignedTo === userId && !['won', 'lost'].includes(lead.status)).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">User &amp; role</h1>
          <p className="mt-1 text-sm text-slate-500">
            Role-based access control: setiap peran hanya melihat modul yang relevan.
          </p>
        </div>
        <button type="button" className="btn-primary btn-sm" onClick={openCreate}>
          + Undang pengguna
        </button>
      </div>

      <section className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Beban lead</th>
                <th>Login terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" tone={user.role === 'sales' ? 'teal' : 'navy'} />
                      <div>
                        <p className="font-medium text-navy-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        {user.jobTitle && <p className="text-xs text-slate-400">{user.jobTitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge tone={user.role === 'super_admin' ? 'purple' : user.role === 'sales' ? 'teal' : 'navy'}>
                      {ROLE_LABEL[user.role] ?? user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={user.status === 'active' ? 'green' : 'slate'}>{user.status}</Badge>
                  </td>
                  <td className="text-sm">
                    {user.role === 'sales' ? `${workload(user.id)} lead aktif` : '—'}
                  </td>
                  <td className="text-sm">
                    {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Belum pernah'}
                    <p className="text-xs text-slate-400">
                      Dibuat {user.createdAt ? formatDate(user.createdAt) : '—'}
                    </p>
                  </td>
                  <td>
                    <button type="button" className="btn-outline btn-sm" onClick={() => openEdit(user)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Matriks hak akses */}
      <section className="card-pad">
        <h2 className="text-base">Matriks hak akses modul</h2>
        <p className="text-sm text-slate-500">
          Menentukan menu yang tampil dan halaman yang bisa dibuka tiap peran.
        </p>
        <div className="mt-4 table-wrap">
          <table className="table min-w-[720px]">
            <thead>
              <tr>
                <th>Modul</th>
                {ROLES.map((role) => (
                  <th key={role.value}>{role.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((moduleName) => (
                <tr key={moduleName}>
                  <td className="font-medium capitalize text-navy-900">{moduleName}</td>
                  {ROLES.map((role) => {
                    const allowed = MODULE_ACCESS[moduleName]?.includes(role.value)
                    return (
                      <td key={role.value}>
                        <span className={allowed ? 'text-teal-700' : 'text-slate-300'}>
                          {allowed ? '✓' : '—'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => (
            <div key={role.value} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-navy-900">{role.label}</p>
              <p className="mt-1 text-xs text-slate-500">{role.description}</p>
              <p className="mt-2 flex flex-wrap gap-1.5">
                {role.permissions.map((permission) => (
                  <Badge key={permission} tone="slate">
                    {permission}
                  </Badge>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit pengguna' : 'Undang pengguna baru'}
        description="Peran menentukan modul yang bisa diakses. Kosongkan kata sandi untuk memakai kata sandi demo."
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="user-name">
              Nama lengkap *
            </label>
            <input
              id="user-name"
              className="input"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="user-email">
              Email *
            </label>
            <input
              id="user-email"
              type="email"
              className="input"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="user-role">
              Peran
            </label>
            <select
              id="user-role"
              className="input"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="user-job">
              Jabatan
            </label>
            <input
              id="user-job"
              className="input"
              value={form.jobTitle}
              onChange={(event) => setForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="user-phone">
              Telepon
            </label>
            <input
              id="user-phone"
              className="input"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="user-status">
              Status akun
            </label>
            <select
              id="user-status"
              className="input"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="user-password">
              {form.id ? 'Kata sandi baru' : 'Kata sandi awal'}
            </label>
            <input
              id="user-password"
              type="password"
              className="input"
              autoComplete="new-password"
              placeholder="Kosongkan = pakai kata sandi demo"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <p className="mt-1 text-xs text-slate-500">Minimal 6 karakter. Hanya diisi bila ingin mengganti.</p>
          </div>
          {error && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Users
