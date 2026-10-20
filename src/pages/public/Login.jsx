import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/brand/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { DEMO_ACCOUNTS } from '../../lib/seed.js'

export function Login() {
  useDocumentTitle('Login tim', 'Masuk ke panel marketing Vanguard Marketing.')
  const { login, isAuthenticated, passwordHint } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    setLoading(true)
    const result = login(email, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <h1 className="mt-8 text-2xl">Masuk ke panel marketing</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kelola lead, kampanye, pipeline, dan laporan dari satu tempat.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="login-email">
                Email kerja
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                placeholder="nama@vanguardmarketing.id"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label" htmlFor="login-password">
                Kata sandi
              </label>
              <input
                id="login-password"
                type="password"
                className="input"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>

          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Ini lingkungan demo: kata sandi untuk semua akun adalah{' '}
            <span className="font-mono font-semibold text-slate-700">{passwordHint}</span>. Pilih akun
            di samping untuk melihat perbedaan hak akses.
          </p>

          <Link to="/" className="btn-ghost btn-sm mt-6 px-0">
            ← Kembali ke portal publik
          </Link>
        </div>
      </div>

      {/* Demo accounts */}
      <div className="hidden bg-navy-900 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
            Akun demo
          </p>
          <h2 className="mt-3 text-2xl text-white">Lima peran pengguna</h2>
          <p className="mt-3 text-sm text-navy-100/80">
            Setiap peran melihat menu dan data yang berbeda, sesuai kebutuhan role-based access.
            Klik salah satu untuk mengisi formulir otomatis.
          </p>

          <ul className="mt-8 space-y-3">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(passwordHint)
                    setError('')
                  }}
                  className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{account.roleLabel}</span>
                    <span className="font-mono text-xs text-teal-200">{account.email}</span>
                  </div>
                  <p className="mt-1 text-xs text-navy-100/70">{account.description}</p>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-navy-100/60">
            Saat backend JWT/NextAuth dipasang, cukup ganti fungsi login di AuthContext tanpa
            mengubah halaman ini.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
