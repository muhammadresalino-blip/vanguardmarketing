import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { useData } from '../../context/DataContext.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { formatDate, formatNumber } from '../../lib/format.js'
import { BLOG_CATEGORIES } from '../../lib/constants.js'

export function Blog() {
  useDocumentTitle(
    'Blog & Panduan',
    'Artikel praktis tentang lead generation, SEO, paid ads, CRM, dan automasi pemasaran untuk tim kecil.',
  )
  const { posts } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const published = useMemo(
    () =>
      posts
        .filter((post) => post.status === 'published')
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
    [posts],
  )

  const filtered = published.filter((post) => {
    const matchesCategory = category === 'all' || post.category === category
    const matchesQuery =
      !query.trim() ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  const featured = published[0]
  const rest = filtered.filter((post) => post.id !== featured?.id)

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl">
            Panduan pemasaran yang bisa langsung dicoba
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Semua artikel ditulis dari praktik lapangan: apa yang kami ukur, apa yang gagal, dan apa
            yang benar-benar mengubah hasil.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          {/* Search & filter */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="lg:w-80">
              <label className="label" htmlFor="blog-search">
                Cari artikel
              </label>
              <input
                id="blog-search"
                className="input"
                placeholder="Misalnya: konversi landing page"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  category === 'all'
                    ? 'bg-navy-700 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua kategori
              </button>
              {BLOG_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    category === item
                      ? 'bg-navy-700 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="Artikel tidak ditemukan"
                description="Coba kata kunci lain atau pilih kategori berbeda."
                icon="🔍"
                action={
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={() => {
                      setQuery('')
                      setCategory('all')
                    }}
                  >
                    Reset filter
                  </button>
                }
              />
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && category === 'all' && !query && (
                <article className="mt-10 card-pad lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-8">
                  <div>
                    <Badge tone="accent">Artikel unggulan</Badge>
                    <h2 className="mt-3 text-2xl">
                      <Link to={`/blog/${featured.slug}`} className="hover:text-navy-700">
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-slate-600">{featured.excerpt}</p>
                    <p className="mt-4 text-xs text-slate-500">
                      {formatDate(featured.publishedAt)} · {featured.readMinutes} menit baca ·{' '}
                      {formatNumber(featured.views)} kali dibaca
                    </p>
                    <Link to={`/blog/${featured.slug}`} className="btn-primary btn-sm mt-5">
                      Baca artikel
                    </Link>
                  </div>
                  <div className="mt-6 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 p-6 text-white lg:mt-0">
                    <p className="text-sm font-semibold text-teal-200">{featured.category}</p>
                    <p className="mt-3 text-lg font-semibold">
                      Ringkasan: tetapkan satu kanal, catat sumbernya, lalu ukur kualitas lead — bukan
                      hanya jumlahnya.
                    </p>
                  </div>
                </article>
              )}

              {/* Grid */}
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <article key={post.id} className="card-pad flex flex-col">
                    <Badge tone="teal">{post.category}</Badge>
                    <h3 className="mt-3 text-base">
                      <Link to={`/blog/${post.slug}`} className="hover:text-navy-700">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{post.excerpt}</p>
                    <p className="mt-4 text-xs text-slate-500">
                      {formatDate(post.publishedAt)} · {post.readMinutes} menit baca
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter callout */}
      <section className="section bg-slate-50">
        <div className="container-page grid gap-6 rounded-2xl border border-navy-100 bg-white p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="text-xl sm:text-2xl">Terima satu ringkasan taktik setiap dua minggu</h2>
            <p className="mt-2 text-sm text-slate-600">
              Kami kirim contoh nyata: kanal yang dicoba, metrik yang berubah, dan kesalahan yang
              perlu dihindari. Tanpa spam.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="btn-primary w-full sm:w-auto">
              Berlangganan ringkasan
            </Link>
            <Link to="/services" className="btn-outline w-full sm:w-auto">
              Lihat layanan
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Blog
