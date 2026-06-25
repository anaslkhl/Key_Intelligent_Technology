import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import { PriorityBadge, StatusBadge } from '../components/common/Badge'
import PageHeader from '../components/common/PageHeader'
import { ErrorState, LoadingState } from '../components/common/QueryState'
import { useAuth } from '../contexts/auth'
import { formatDate } from '../utils/formatters'
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';

const activeStatuses = new Set(['new', 'open', 'in_progress', 'waiting_client'])

export default function Dashboard() {
  const { user } = useAuth()
  const ticketsQuery = useQuery({
    queryKey: ['tickets', 'dashboard'],
    queryFn: () => apiClient.get('/tickets', { params: { per_page: 50 } }).then((response) => response.data),
  })
  const robotsQuery = useQuery({
    queryKey: ['robots', 'dashboard'],
    queryFn: () => apiClient.get('/robots', { params: { per_page: 50 } }).then((response) => response.data),
  })

  const isLoading = ticketsQuery.isLoading || robotsQuery.isLoading
  const error = ticketsQuery.error || robotsQuery.error
  const tickets = ticketsQuery.data?.data || []
  const robots = robotsQuery.data?.data || []
  const recentTickets = tickets.slice(0, 5)
  const stats = [
    { label: 'Total tickets', value: ticketsQuery.data?.meta?.total ?? tickets.length, tone: 'text-slate-900' },
    { label: 'Open requests', value: tickets.filter((ticket) => activeStatuses.has(ticket.status)).length, tone: 'text-blue-600' },
    { label: 'Resolved', value: tickets.filter((ticket) => ticket.status === 'resolved').length, tone: 'text-green-600' },
    { label: 'Registered robots', value: robotsQuery.data?.meta?.total ?? robots.length, tone: 'text-slate-900' },
  ]

  if (isLoading) return <ClientPage><LoadingState label="Loading your dashboard..." /></ClientPage>
  if (error) return <ClientPage><ErrorState message="Unable to load your dashboard." onRetry={() => { ticketsQuery.refetch(); robotsQuery.refetch() }} /></ClientPage>

  return (
    <ClientPage>
    <WelcomeBanner />
      <PageHeader
        eyebrow="Client dashboard"
        title={`Welcome, ${user.name}`}
        description="A current view of your robots and support activity."
        actions={(
          <>
            <Link to="/tickets/create" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Create ticket</Link>
            <Link to="/robots/register" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Register robot</Link>
          </>
        )}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <strong className={`mt-3 block text-3xl font-bold ${stat.tone}`}>{stat.value}</strong>
          </article>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="!text-lg !font-semibold text-slate-900">Recent tickets</h2>
            <p className="mt-1 text-sm text-slate-500">Your latest support activity.</p>
          </div>
          <Link to="/tickets" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">No tickets yet. Create one when you need support.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-6 py-3">Ticket</th><th className="px-6 py-3">Robot</th><th className="px-6 py-3">Priority</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Created</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4"><Link to={`/tickets/${ticket.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{ticket.title}</Link></td>
                    <td className="px-6 py-4 text-slate-600">{ticket.robot?.name || ticket.robot?.product?.model || 'Robot'}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(ticket.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ClientPage>
  )
}

function ClientPage({ children }) {
  return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section>
}
