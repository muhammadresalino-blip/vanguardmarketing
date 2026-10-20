import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export function NotFound() {
  useDocumentTitle('Halaman tidak ditemukan')

  return (
    <section className="container-page py-24 text-center">
      <p className="text-sm font-semibold text-accent-500">404</p>
      <h1 className="mt-3 text-3xl">Halaman tidak ditemukan</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">
        Tautan yang Anda buka mungkin sudah berubah. Coba mulai dari halaman utama atau lihat
        layanan kami.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          Halaman utama
        </Link>
        <Link to="/contact" className="btn-outline">
          Hubungi kami
        </Link>
      </div>
    </section>
  )
}

export default NotFound
