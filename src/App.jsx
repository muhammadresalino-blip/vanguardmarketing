import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { DataProvider, useData } from './context/DataContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import PublicLayout from './components/layout/PublicLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'
import { captureUtmContext, getUtmContext } from './lib/utm.js'
import { CHANNEL_LABEL } from './lib/constants.js'

import Home from './pages/public/Home.jsx'
import Services from './pages/public/Services.jsx'
import About from './pages/public/About.jsx'
import CaseStudies from './pages/public/CaseStudies.jsx'
import Blog from './pages/public/Blog.jsx'
import BlogPost from './pages/public/BlogPost.jsx'
import Contact from './pages/public/Contact.jsx'
import CampaignLanding from './pages/public/CampaignLanding.jsx'
import ThankYou from './pages/public/ThankYou.jsx'
import Login from './pages/public/Login.jsx'
import NotFound from './pages/public/NotFound.jsx'

import Dashboard from './pages/admin/Dashboard.jsx'
import Leads from './pages/admin/Leads.jsx'
import LeadDetail from './pages/admin/LeadDetail.jsx'
import Pipeline from './pages/admin/Pipeline.jsx'
import Tasks from './pages/admin/Tasks.jsx'
import Campaigns from './pages/admin/Campaigns.jsx'
import Analytics from './pages/admin/Analytics.jsx'
import Content from './pages/admin/Content.jsx'
import Users from './pages/admin/Users.jsx'
import Settings from './pages/admin/Settings.jsx'

// Kembalikan posisi scroll saat berpindah halaman.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

// Catat kunjungan portal publik untuk laporan trafik (kecuali halaman campaign
// landing page yang mencatat sendiri lengkap dengan konteks kampanye).
function PortalViewTracker() {
  const { pathname } = useLocation()
  const { logEvent, campaigns } = useData()
  const lastPath = useRef(null)

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/lp/')) return
    if (lastPath.current === pathname) return
    lastPath.current = pathname

    const utm = getUtmContext()
    const matchedCampaign = campaigns.find((campaign) =>
      utm.utm_campaign ? campaign.name.toLowerCase().includes(utm.utm_campaign.replace(/-/g, ' ').slice(0, 18)) : false,
    )

    logEvent({
      eventName: 'page_view',
      campaignId: matchedCampaign?.id ?? null,
      source: matchedCampaign ? CHANNEL_LABEL[matchedCampaign.channel] : utm.utm_source ?? 'Direct',
      pageUrl: pathname,
      utmSource: utm.utm_source ?? null,
      utmMedium: utm.utm_medium ?? null,
      sessionMinutes: 1,
    })
  }, [pathname, logEvent, campaigns])

  return null
}

// Sekali saat aplikasi dibuka: simpan konteks UTM dari URL agar dipakai form.
function UtmCapture() {
  useEffect(() => {
    captureUtmContext()
  }, [])
  return null
}

// Tampilkan layar tunggu sampai snapshot pertama dari API selesai dimuat.
// Tanpa ini, halaman bisa sempat merender dengan data kosong.
function DataGate({ children }) {
  const { loading, error, refresh } = useData()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">Memuat data Vanguard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="card-pad max-w-md text-center">
          <h1 className="text-xl">Server belum bisa dihubungi</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <p className="mt-2 text-xs text-slate-500">
            Jalankan API dengan <code className="rounded bg-slate-100 px-1">pnpm dev:api</code>, lalu coba lagi.
          </p>
          <button type="button" className="btn-primary mt-5" onClick={() => refresh()}>
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  return children
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return children
}

// Batasi akses modul sesuai peran pengguna (role-based access control).
function ModuleGuard({ module, children }) {
  const { can, user } = useAuth()

  if (!can(module)) {
    return (
      <div className="card-pad max-w-xl">
        <h1 className="text-xl">Akses ditolak</h1>
        <p className="mt-2 text-sm text-slate-600">
          Peran Anda ({user?.role}) tidak memiliki izin membuka modul ini. Hubungi Super Admin bila
          Anda membutuhkan akses tambahan.
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Hak akses diatur di halaman User &amp; Role.
        </p>
      </div>
    )
  }
  return children
}

export function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <ErrorBoundary>
          <DataGate>
            <UtmCapture />
            <ScrollToTop />
            <PortalViewTracker />
            <Routes>
            {/* Portal publik */}
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="about" element={<About />} />
              <Route path="case-studies" element={<CaseStudies />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="contact" element={<Contact />} />
              <Route path="lp/:slug" element={<CampaignLanding />} />
              <Route path="thank-you" element={<ThankYou />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Login tim */}
            <Route path="/admin/login" element={<Login />} />

            {/* Panel admin */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route
                index
                element={
                  <ModuleGuard module="dashboard">
                    <Dashboard />
                  </ModuleGuard>
                }
              />
              <Route
                path="leads"
                element={
                  <ModuleGuard module="leads">
                    <Leads />
                  </ModuleGuard>
                }
              />
              <Route
                path="leads/:id"
                element={
                  <ModuleGuard module="leads">
                    <LeadDetail />
                  </ModuleGuard>
                }
              />
              <Route
                path="pipeline"
                element={
                  <ModuleGuard module="pipeline">
                    <Pipeline />
                  </ModuleGuard>
                }
              />
              <Route
                path="tasks"
                element={
                  <ModuleGuard module="tasks">
                    <Tasks />
                  </ModuleGuard>
                }
              />
              <Route
                path="campaigns"
                element={
                  <ModuleGuard module="campaigns">
                    <Campaigns />
                  </ModuleGuard>
                }
              />
              <Route
                path="analytics"
                element={
                  <ModuleGuard module="analytics">
                    <Analytics />
                  </ModuleGuard>
                }
              />
              <Route
                path="content"
                element={
                  <ModuleGuard module="content">
                    <Content />
                  </ModuleGuard>
                }
              />
              <Route
                path="users"
                element={
                  <ModuleGuard module="users">
                    <Users />
                  </ModuleGuard>
                }
              />
              <Route
                path="settings"
                element={
                  <ModuleGuard module="settings">
                    <Settings />
                  </ModuleGuard>
                }
              />
            </Route>
          </Routes>
          </DataGate>
        </ErrorBoundary>
      </AuthProvider>
    </DataProvider>
  )
}

export default App
