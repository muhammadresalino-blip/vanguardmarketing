import { useState } from 'react'
import { FileText, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData, useUserMap } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { BLOG_CATEGORIES } from '../../lib/constants.js'
import { formatDate, formatNumber, slugify } from '../../lib/format.js'

const TABS = [
  { value: 'posts', label: 'Artikel blog' },
  { value: 'pages', label: 'Halaman portal' },
  { value: 'landing', label: 'Landing page & CTA' },
]

const EMPTY_POST = {
  id: null,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: BLOG_CATEGORIES[0],
  status: 'draft',
  publishedAt: null,
}

const EMPTY_PAGE = { id: null, slug: '', title: '', excerpt: '', status: 'draft' }

export function Content() {
  useDocumentTitle('Konten', 'Kelola artikel blog, halaman portal, dan landing page kampanye.')
  const { posts, pages, landingPages, campaigns, savePost, deletePost, savePage, saveLandingPage } = useData()
  const { user } = useAuth()
  const userMap = useUserMap()

  const [tab, setTab] = useState('posts')
  const [postForm, setPostForm] = useState(EMPTY_POST)
  const [postModal, setPostModal] = useState(false)
  const [pageForm, setPageForm] = useState(EMPTY_PAGE)
  const [pageModal, setPageModal] = useState(false)

  const openNewPost = () => {
    setPostForm(EMPTY_POST)
    setPostModal(true)
  }

  const openEditPost = (post) => {
    setPostForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      publishedAt: post.publishedAt,
    })
    setPostModal(true)
  }

  const savePostForm = () => {
    if (postForm.title.trim().length < 5) return
    const isNew = !postForm.id
    savePost({
      ...postForm,
      title: postForm.title.trim(),
      slug: postForm.slug || slugify(postForm.title),
      ...(isNew ? { authorId: user?.id } : {}),
      publishedAt:
        postForm.status === 'published'
          ? postForm.publishedAt ?? new Date().toISOString()
          : postForm.publishedAt,
    })
    setPostModal(false)
    setPostForm(EMPTY_POST)
  }

  const openNewPage = () => {
    setPageForm(EMPTY_PAGE)
    setPageModal(true)
  }

  const openEditPage = (page) => {
    setPageForm({
      id: page.id,
      slug: page.slug,
      title: page.title,
      excerpt: page.excerpt,
      status: page.status,
    })
    setPageModal(true)
  }

  const savePageForm = () => {
    if (!pageForm.title.trim() || !pageForm.slug.trim()) return
    savePage({
      ...pageForm,
      authorId: user?.id,
      updatedAt: new Date().toISOString(),
    })
    setPageModal(false)
    setPageForm(EMPTY_PAGE)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl">Manajemen konten</h1>
          <p className="mt-1 text-sm text-slate-500">
            Artikel, halaman, dan landing page. Perubahan langsung berlaku di portal publik.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === 'posts' && (
            <button type="button" className="btn-primary btn-sm" onClick={openNewPost}>
              + Artikel baru
            </button>
          )}
          {tab === 'pages' && (
            <button type="button" className="btn-primary btn-sm" onClick={openNewPage}>
              + Halaman baru
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              tab === item.value
                ? 'bg-primary-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <section className="card">
          {posts.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Belum ada artikel" icon={<FileText className="h-7 w-7 text-slate-500" />} />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th>Penulis</th>
                    <th>Tanggal</th>
                    <th>Dibaca</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {[...posts]
                    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
                    .map((post) => (
                      <tr key={post.id}>
                        <td>
                          <p className="font-medium text-neutral-900">{post.title}</p>
                          <p className="text-xs text-slate-500">/blog/{post.slug}</p>
                        </td>
                        <td className="text-sm">{post.category}</td>
                        <td>
                          <Badge tone={post.status === 'published' ? 'green' : 'slate'}>{post.status}</Badge>
                        </td>
                        <td className="text-sm">{userMap.get(post.authorId)?.name ?? '-'}</td>
                        <td className="text-sm">{post.publishedAt ? formatDate(post.publishedAt) : '—'}</td>
                        <td className="text-sm">{formatNumber(post.views ?? 0)}</td>
                        <td>
                          <div className="flex flex-wrap gap-1.5">
                            <button type="button" className="btn-outline btn-sm" onClick={() => openEditPost(post)}>
                              Edit
                            </button>
                            {post.status === 'published' && (
                              <Link to={`/blog/${post.slug}`} className="btn-ghost btn-sm">
                                Lihat
                              </Link>
                            )}
                            {user?.role !== 'sales' && (
                              <button
                                type="button"
                                className="btn-ghost btn-sm text-red-600"
                                onClick={() => {
                                  if (window.confirm(`Hapus artikel "${post.title}"?`)) deletePost(post.id)
                                }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'pages' && (
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Halaman</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Terakhir diubah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <p className="font-medium text-neutral-900">{page.title}</p>
                      <p className="text-xs text-slate-500">{page.excerpt}</p>
                    </td>
                    <td className="font-mono text-xs text-slate-600">/{page.slug}</td>
                    <td>
                      <Badge tone={page.status === 'published' ? 'green' : 'slate'}>{page.status}</Badge>
                    </td>
                    <td className="text-sm">{formatDate(page.updatedAt)}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" className="btn-outline btn-sm" onClick={() => openEditPage(page)}>
                          Edit
                        </button>
                        {page.status === 'published' && page.slug !== 'home' && (
                          <Link to={`/${page.slug}`} className="btn-ghost btn-sm">
                            Lihat
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'landing' && (
        <section className="space-y-4">
          {landingPages.length === 0 ? (
            <EmptyState
              title="Belum ada landing page"
              description="Buat kampanye terlebih dahulu; landing page akan dibuat otomatis."
              icon={<Target className="h-7 w-7 text-slate-500" />}
            />
          ) : (
            landingPages.map((page) => {
              const campaign = campaigns.find((item) => item.id === page.campaignId)
              return (
                <article key={page.id} className="card-pad">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg">{page.slug}</h2>
                        <Badge tone={page.status === 'published' ? 'green' : 'slate'}>{page.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Kampanye: {campaign?.name ?? '—'} ·{' '}
                        <Link to={`/lp/${page.slug}`} className="text-accent-600 hover:underline">
                          /lp/{page.slug}
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor={`lp-title-${page.id}`}>
                        Headline
                      </label>
                      <input
                        id={`lp-title-${page.id}`}
                        className="input"
                        defaultValue={page.title}
                        onBlur={(event) => saveLandingPage({ id: page.id, title: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor={`lp-offer-${page.id}`}>
                        Penawaran / CTA
                      </label>
                      <input
                        id={`lp-offer-${page.id}`}
                        className="input"
                        defaultValue={page.offer}
                        onBlur={(event) => saveLandingPage({ id: page.id, offer: event.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor={`lp-sub-${page.id}`}>
                        Sub-headline
                      </label>
                      <textarea
                        id={`lp-sub-${page.id}`}
                        rows={2}
                        className="input"
                        defaultValue={page.subtitle}
                        onBlur={(event) => saveLandingPage({ id: page.id, subtitle: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <select
                      className="input w-40"
                      value={page.status}
                      onChange={(event) => saveLandingPage({ id: page.id, status: event.target.value })}
                      aria-label="Status landing page"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                    <Link to={`/lp/${page.slug}`} className="btn-outline btn-sm">
                      Pratinjau
                    </Link>
                    <p className="text-xs text-slate-500">
                      Perubahan tersimpan otomatis saat kolom kehilangan fokus.
                    </p>
                  </div>
                </article>
              )
            })
          )}
        </section>
      )}

      {/* Modal artikel */}
      <Modal
        open={postModal}
        onClose={() => setPostModal(false)}
        title={postForm.id ? 'Edit artikel' : 'Artikel baru'}
        size="lg"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setPostModal(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={savePostForm}>
              Simpan artikel
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="post-title">
              Judul *
            </label>
            <input
              id="post-title"
              className="input"
              value={postForm.title}
              onChange={(event) =>
                setPostForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                  slug: prev.id ? prev.slug : slugify(event.target.value),
                }))
              }
            />
          </div>

          <div>
            <label className="label" htmlFor="post-slug">
              Slug URL
            </label>
            <input
              id="post-slug"
              className="input"
              value={postForm.slug}
              onChange={(event) => setPostForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
            />
          </div>

          <div>
            <label className="label" htmlFor="post-category">
              Kategori
            </label>
            <select
              id="post-category"
              className="input"
              value={postForm.category}
              onChange={(event) => setPostForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              {BLOG_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="post-excerpt">
              Ringkasan (dipakai di kartu artikel & meta description)
            </label>
            <textarea
              id="post-excerpt"
              rows={2}
              className="input"
              value={postForm.excerpt}
              onChange={(event) => setPostForm((prev) => ({ ...prev, excerpt: event.target.value }))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label" htmlFor="post-content">
              Isi artikel
            </label>
            <textarea
              id="post-content"
              rows={10}
              className="input font-mono text-xs"
              value={postForm.content}
              onChange={(event) => setPostForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder={'Tulis paragraf biasa.\n\n## Sub-judul\n\n1. Poin pertama\n2. Poin kedua'}
            />
            <p className="mt-1 text-xs text-slate-500">
              Format ringan: paragraf dipisahkan baris kosong, awali sub-judul dengan “## ”, dan
              daftar bernomor dengan “1. ”.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="post-status">
              Status
            </label>
            <select
              id="post-status"
              className="input"
              value={postForm.status}
              onChange={(event) => setPostForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal halaman */}
      <Modal
        open={pageModal}
        onClose={() => setPageModal(false)}
        title={pageForm.id ? 'Edit halaman' : 'Halaman baru'}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setPageModal(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary" onClick={savePageForm}>
              Simpan halaman
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="page-title">
              Judul *
            </label>
            <input
              id="page-title"
              className="input"
              value={pageForm.title}
              onChange={(event) => setPageForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="page-slug">
              Slug *
            </label>
            <input
              id="page-slug"
              className="input"
              value={pageForm.slug}
              onChange={(event) => setPageForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="page-excerpt">
              Deskripsi singkat
            </label>
            <textarea
              id="page-excerpt"
              rows={2}
              className="input"
              value={pageForm.excerpt}
              onChange={(event) => setPageForm((prev) => ({ ...prev, excerpt: event.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="page-status">
              Status
            </label>
            <select
              id="page-status"
              className="input"
              value={pageForm.status}
              onChange={(event) => setPageForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Content
