import { Bot, Clock, Eye, Globe, TimerReset } from 'lucide-react'

const cards = [
  { label: 'Active Sessions (24h)', key: 'active_sessions', icon: Clock, color: 'text-emerald-600' },
  { label: 'Page Views (Today)', key: 'page_views_today', icon: Eye, color: 'text-cyan-600' },
  { label: 'Total Visitors', key: 'total_visitors', icon: Globe, color: 'text-blue-600' },
  { label: 'AI Messages (Today)', key: 'ai_messages_today', icon: Bot, color: 'text-violet-600' },
  { label: 'Avg Response Time', key: 'avg_response_time', icon: TimerReset, color: 'text-rose-600', suffix: 'ms' },
]

export default function StatisticsOverview({ data }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ label, key, icon: Icon, color, suffix }) => (
        <article key={key} className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <Icon size={20} className={color} />
          </div>
          <strong className="mt-4 block text-3xl text-slate-900">
            {data?.[key] ?? 0}{suffix ? <span className="ml-1 text-base font-normal text-slate-500">{suffix}</span> : null}
          </strong>
        </article>
      ))}
    </div>
  )
}
