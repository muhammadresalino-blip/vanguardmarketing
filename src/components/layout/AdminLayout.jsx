import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../brand/Logo.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { ROLE_LABEL } from '../../lib/constants.js'
import { formatRelativeTime } from '../../lib/format.js'

const MENU = [
  { to: '/admin', label: 'Dashboard', icon: '📊', module: 'dashboard', end: true },
  { to: '/admin/leads', label: 'CRM Lead', icon: '👥', module: 'leads' },
  { to: '/admin/pipeline', label: 'Pipeline & Deal', icon: '🔀', module: 'pipeline' },
  { to: '/admin/tasks', label: 'Tugas Follow-up', icon: '✅', module: 'tasks' },
  { to: '/admin/campaigns', label: 'Kampanye', icon: '📣', module: 'campaigns' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈', module: 'analytics' },
  { to: '/admin/content', label: 'Konten', icon: '📝', module: 'content' },
  { to: '/admin/users', label: 'User & Role', icon: '🔐', module: 'users' },
  { to: '/admin/settings', label: 'Pengaturan', icon: '⚙️', module: 'settings' },
]

function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const mine = useMemo(
    () =>
      notifications
        .filter((n) => !user || n.userId === user.id || n.type === 'report')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 12),
    [notifications, user],
  )
  const unread = mine.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Notifikasi"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-900">Notifikasi</p>
              <button
                type="button"
                className="text-xs font-medium text-accent-600 hover:underline"
                onClick={() => markAllNotificationsRead(user?.id)}
              >
                Tandai dibaca
              </button>
            </div>
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {mine.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-slate-500">Belum ada notifikasi.</li>
              )}
              {mine.map((notification) => (
                <li key={notification.id} className={notification.read ? 'bg-white' : 'bg-primary-50/50'}>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left"
                    onClick={() => {
                      markNotificationRead(notification.id)
                      setOpen(false)
                      if (notification.leadId) navigate(`/admin/leads/${notification.leadId}`)
                    }}
                  >
                    <p className="text-xs text-slate-500">{formatRelativeTime(notification.createdAt)}</p>
                    <p className="mt-1 text-sm text-slate-700">{notification.message}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export function AdminLayout() {
  const { user, logout, can } = useAuth()
  const { leads, tasks, settings } = useData()
  const users = useUserMap()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = MENU.filter((item) => can(item.module))
  const myLeads = leads.filter((lead) => !user || lead.assignedTo === user.id)
  const myOpenTasks = tasks.filter(
    (task) => task.status === 'open' && (!user || task.assignedTo === user.id),
  )

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Navigasi admin">
      <div className="px-2 py-3">
        <Logo to="/admin" />
      </div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-neutral-800'
            }`
          }
        >
          <span className="flex items-center gap-2.5">
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </span>
          {item.module === 'leads' && myLeads.length > 0 && (
            <span className="rounded-full bg-slate-200 px-2 text-xs font-semibold text-slate-600">
              {myLeads.length}
            </span>
          )}
          {item.module === 'tasks' && myOpenTasks.length > 0 && (
            <span className="rounded-full bg-accent-100 px-2 text-xs font-semibold text-accent-700">
              {myOpenTasks.length}
            </span>
          )}
        </NavLink>
      ))}

      <div className="mt-auto space-y-3 p-2 pt-6">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Target respons lead</p>
          <p className="mt-1">&lt; {settings.leadResponseTargetMinutes} menit sejak form masuk.</p>
        </div>
        <Link to="/" className="btn-outline btn-sm w-full">
          Lihat portal publik
        </Link>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
          {sidebar}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Tutup menu"
              className="absolute inset-0 bg-neutral-900/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full w-72 max-w-[85%] overflow-y-auto bg-white">{sidebar}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn-outline btn-sm lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Buka menu"
                >
                  ☰
                </button>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-neutral-900">
                    {items.find((item) => location.pathname === item.to)?.label ?? 'Panel Marketing'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user ? `${ROLE_LABEL[user.role]} · ${user.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/admin/leads?status=new" className="hidden btn-teal btn-sm sm:inline-flex">
                  Lead baru: {leads.filter((l) => l.status === 'new').length}
                </Link>
                <NotificationBell />
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                  <Avatar name={user?.name} size="sm" tone="teal" />
                  <div className="hidden leading-tight sm:block">
                    <p className="text-xs font-semibold text-neutral-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500">{ROLE_LABEL[user?.role] ?? ''}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => {
                      logout()
                      navigate('/admin/login')
                    }}
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <Outlet />
          </main>

          <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                Data demo tersimpan di browser (localStorage). Masuk sebagai{' '}
                <span className="font-medium text-slate-600">
                  {users.get(user?.id)?.email ?? '-'}
                </span>
              </p>
              <Badge tone="slate">MVP · tanpa backend</Badge>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
