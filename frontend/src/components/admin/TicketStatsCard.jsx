import { Clock, Inbox, Loader, TicketCheck, XCircle } from 'lucide-react'

const statusConfig = [
  { label: 'Open', key: 'open', icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'In Progress', key: 'in_progress', icon: Loader, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Resolved', key: 'resolved', icon: TicketCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Closed', key: 'closed', icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
]

export default function TicketStatsCard({ data }) {
  if (!data) return null

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Ticket Statistics</h2>
        <p className="mt-1 text-sm text-slate-500">Current ticket distribution and resolution performance</p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {statusConfig.map(({ label, key, icon: Icon, color, bg }) => (
          <div key={key} className={`flex items-center gap-3 rounded-lg ${bg} px-4 py-3`}>
            <Icon size={20} className={color} />
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <strong className="text-xl text-slate-900">{data[key] ?? 0}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3">
        <Clock size={18} className="text-rose-500" />
        <div>
          <p className="text-xs font-semibold text-slate-500">Average Resolution Time</p>
          <strong className="text-lg text-slate-900">
            {data.avg_resolution_time_hours > 0
              ? `${data.avg_resolution_time_hours}h`
              : 'N/A'}
          </strong>
        </div>
      </div>
    </section>
  )
}
