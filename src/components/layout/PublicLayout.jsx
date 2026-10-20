import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from '../brand/Logo.jsx'
import { COMPANY, NAV_LINKS } from '../../lib/content.js'
import { getUtmContext, utmSummary } from '../../lib/utm.js'

const CURRENT_YEAR = new Date().getFullYear()

function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-navy-800' : 'text-slate-600 hover:text-navy-800'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/admin/login" className="btn-ghost btn-sm">
            Login tim
          </Link>
          <Link to="/contact" className="btn-accent btn-sm">
            Konsultasi gratis
          </Link>
        </div>

        <button
          type="button"
          className="btn-outline btn-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? 'Tutup' : 'Menu'}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Navigasi seluler">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-navy-50 text-navy-800' : 'text-slate-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link to="/contact" className="btn-accent" onClick={() => setOpen(false)}>
                Konsultasi gratis
              </Link>
              <Link to="/admin/login" className="btn-outline" onClick={() => setOpen(false)}>
                Login tim
              </Link>
            </div>
          </nav>
        </div>
      )}

      {location.pathname !== '/' && (
        <div className="hidden border-t border-slate-100 bg-slate-50/70 py-1.5 text-center text-xs text-slate-500 lg:block">
          {utmSummary(getUtmContext())}
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 text-navy-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-md text-sm text-navy-100/80">{COMPANY.tagline}</p>
          <div className="mt-5 space-y-1 text-sm text-navy-100/80">
            <p>{COMPANY.address}</p>
            <p>{COMPANY.phone}</p>
            <p>{COMPANY.email}</p>
            <p>{COMPANY.hours}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Portal</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-100/80">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/admin/login" className="hover:text-white">
                Login tim
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Terhubung</h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-100/80">
            <li>
              <a href={`https://wa.me/${COMPANY.whatsapp}`} className="hover:text-white" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" className="hover:text-white" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://instagram.com" className="hover:text-white" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY.email}`} className="hover:text-white">
                Email
              </a>
            </li>
          </ul>

          <Link to="/contact" className="btn-teal btn-sm mt-5">
            Minta audit funnel
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {CURRENT_YEAR} {COMPANY.name}. Seluruh hak cipta dilindungi.
          </p>
          <p>
            Kebijakan privasi · Cookie policy · Consent form untuk pengumpulan data prospek.
          </p>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
