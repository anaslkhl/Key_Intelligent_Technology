export function AdminPage({ children }) {
  return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section>
}

export const inputClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900'

export const featureStatuses = ['pending', 'under_review', 'planned', 'in_development', 'shipped', 'declined']
