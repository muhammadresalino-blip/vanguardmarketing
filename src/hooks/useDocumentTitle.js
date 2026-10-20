import { useEffect } from 'react'

// Menjaga judul dokumen tetap deskriptif per halaman (kebutuhan SEO dasar).
export function useDocumentTitle(title, description) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} — Vanguard Marketing` : 'Vanguard Marketing'

    const metaTag = document.querySelector('meta[name="description"]')
    const previousDescription = metaTag?.getAttribute('content')
    if (metaTag && description) metaTag.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (metaTag && previousDescription) metaTag.setAttribute('content', previousDescription)
    }
  }, [title, description])
}
