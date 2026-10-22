import { Inbox } from 'lucide-react'

// Kosong: tile putih rounded sesuai referensi ikon; `icon` menerima node SVG
// (lucide-react) — default Inbox outline slate.
export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
        aria-hidden="true"
      >
        {icon ?? <Inbox className="h-7 w-7 text-slate-500" />}
      </span>
      <p className="font-semibold text-neutral-900">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
