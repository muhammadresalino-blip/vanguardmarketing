import { Link, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import Badge from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { formatDate, formatNumber } from '../../lib/format.js'

function renderContent(content = '') {
  return content.split('\n\n').map((block, index) => {
    const key = `block-${index}`
    if (block.startsWith('## ')) {
      return (
        <h2 key={key} className="mt-8 text-xl">
          {block.replace('## ', '')}
        </h2>
      )
    }
    if (/^\d+\.\s/m.test(block)) {
      const items = block
        .split('\n')
        .filter((line) => /^\d+\.\s/.test(line))
        .map((line) => line.replace(/^\d+\.\s/, ''))
      return (
        <ol key={key} className="mt-4 list-decimal space-y-2 pl-5 text-slate-600">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )
    }
    return (
      <p key={key} className="mt-4 text-slate-600">
        {block}
      </p>
    )
  })
}

export function BlogPost() {
  const { slug } = useParams()
  const { posts, users } = useData()
  const post = posts.find((item) => item.slug === slug)
  const author = users.find((user) => user.id === post?.authorId)

  useDocumentTitle(post?.title ?? 'Artikel tidak ditemukan', post?.excerpt)

  if (!post) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Artikel tidak ditemukan"
          description="Tautan mungkin salah atau artikel sudah dipindahkan."
          action={
            <Link to="/blog" className="btn-primary btn-sm">
              Kembali ke blog
            </Link>
          }
          icon="📄"
        />
      </div>
    )
  }

  const related = posts
    .filter((item) => item.category === post.category && item.id !== post.id && item.status === 'published')
    .slice(0, 3)

  return (
    <article className="container-page py-12 sm:py-16">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/blog" className="hover:text-primary-600">
          Blog
        </Link>{' '}
        / <span className="text-slate-600">{post.category}</span>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Badge tone="teal">{post.category}</Badge>
          <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-200 py-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Avatar name={author?.name ?? 'Tim Vanguard'} size="sm" />
              {author?.name ?? 'Tim Vanguard'}
            </span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readMinutes} menit baca</span>
            <span>{formatNumber(post.views)} kali dibaca</span>
          </div>

          <div className="prose-vanguard mt-2 max-w-none">{renderContent(post.content)}</div>

          <div className="mt-10 rounded-xl border border-neutral-200 bg-primary-50 p-6">
            <h2 className="text-lg">Ingin kami cek funnel Anda?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Kami bisa menunjukkan bagian mana dari alur Anda yang paling berpotensi kehilangan
              prospek.
            </p>
            <Link to="/contact" className="btn-accent btn-sm mt-4">
              Minta audit gratis
            </Link>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card-pad">
            <h2 className="text-base">Artikel terkait</h2>
            {related.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Belum ada artikel lain di kategori ini.</p>
            ) : (
              <ul className="mt-3 space-y-4">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`/blog/${item.slug}`} className="text-sm font-semibold text-neutral-800 hover:text-primary-600">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.publishedAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-pad bg-slate-50">
            <h2 className="text-base">Checklist cepat</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>✓ Catat utm_source, utm_medium, utm_campaign</li>
              <li>✓ Tetapkan target waktu respons lead</li>
              <li>✓ Cek duplikat berdasarkan email atau telepon</li>
              <li>✓ Tinjau kualitas lead per kanal tiap minggu</li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  )
}

export default BlogPost
