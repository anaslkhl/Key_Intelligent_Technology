import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, Clock3, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

const statConfig = [
  ['Total tickets', 'total_tickets', Inbox, 'text-blue-600'],
  ['Open', 'open_tickets', AlertTriangle, 'text-amber-600'],
  ['In progress', 'in_progress_tickets', Clock3, 'text-cyan-600'],
  ['Resolved', 'resolved_tickets', CheckCircle2, 'text-emerald-600'],
]

export default function AgentDashboard() {
  const query = useQuery({ queryKey: ['agent-stats'], queryFn: () => apiClient.get('/agent/stats').then((response) => response.data.data) })

  if (query.isLoading) return <AgentPage><LoadingState label="Loading support operations..." /></AgentPage>
  if (query.isError) return <AgentPage><ErrorState message="Unable to load the agent dashboard." onRetry={query.refetch} /></AgentPage>

  const stats = query.data
  const recent = stats.recent_tickets || []

  return (
    <AgentPage>
      <PageHeader eyebrow="Support operations" title="Agent dashboard" description="Monitor the queue, priorities, and recent client activity." actions={<Link to="/agent/tickets" className="button button-primary">Open ticket queue</Link>} />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map(([label, key, Icon, tone]) => <article key={key} className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><Icon size={20} className={tone} /></div><strong className="mt-4 block text-3xl text-slate-900">{stats[key] ?? 0}</strong></article>)}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="!text-lg !font-semibold text-slate-900">Recent tickets</h2><p className="mt-1 text-sm text-slate-500">Latest requests across all clients.</p></div><Link to="/agent/tickets" className="text-sm font-semibold text-blue-600">View all</Link></div>
          <div className="divide-y divide-slate-200">{recent.map((ticket) => <Link key={ticket.id} to={`/agent/tickets/${ticket.id}`} className="flex flex-col gap-3 p-5 hover:bg-slate-50 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-900">{ticket.title}</strong><span className="mt-1 block text-xs text-slate-500">{ticket.user?.name || 'Client'} · {formatDate(ticket.created_at)}</span></div><div className="flex gap-2"><PriorityBadge priority={ticket.priority} /><StatusBadge status={ticket.status} /></div></Link>)}</div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="!text-lg !font-semibold text-slate-900">Priority breakdown</h2><div className="mt-5 grid gap-4">{Object.entries(stats.priority_breakdown || {}).map(([priority, count]) => <div key={priority} className="flex items-center justify-between"><PriorityBadge priority={priority} /><strong className="text-xl text-slate-900">{count}</strong></div>)}</div></section>
      </div>
    </AgentPage>
  )
}

function AgentPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
