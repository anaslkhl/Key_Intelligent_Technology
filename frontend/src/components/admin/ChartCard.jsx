export default function ChartCard({ title, description, children, className = '' }) {
  return <section className={`rounded-lg border border-slate-200 bg-white p-5 sm:p-6 ${className}`}><div className="mb-5"><h2 className="!text-lg !font-semibold text-slate-900">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><div className="h-64 w-full">{children}</div></section>
}
