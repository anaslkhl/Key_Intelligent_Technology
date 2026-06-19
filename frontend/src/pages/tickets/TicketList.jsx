import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting_client', label: 'Waiting for client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function TicketList() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['tickets', { status, page }],
    queryFn: () => apiClient.get('/tickets', { params: { status: status || undefined, page, per_page: 10 } }).then((response) => response.data),
  })
  const tickets = query.data?.data || []

  return (
    <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Client support"
          title="Support tickets"
          description="Track requests and continue conversations with KIT technicians."
          actions={<Link to="/tickets/create" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Create ticket</Link>}
        />

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:w-64">
            Status
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1) }}
              className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <p className="text-sm text-slate-500">{query.data?.meta?.total ?? 0} tickets</p>
        </div>

        <div className="mt-5">
          {query.isLoading && <LoadingState label="Loading tickets..." />}
          {query.isError && <ErrorState message="Unable to load tickets." onRetry={query.refetch} />}
          {query.isSuccess && tickets.length === 0 && (
            <EmptyState
              title="No tickets found"
              description={status ? 'No tickets match this status.' : 'Create your first support request to start a conversation.'}
              action={!status && <Link to="/tickets/create" className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Create ticket</Link>}
            />
          )}
          {query.isSuccess && tickets.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-200 md:hidden">
                {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-[840px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr><th className="px-6 py-3">Ticket</th><th className="px-6 py-3">Robot</th><th className="px-6 py-3">Priority</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Updated</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4"><Link to={`/tickets/${ticket.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{ticket.title}</Link><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{ticket.category?.name}</p></td>
                        <td className="px-6 py-4 text-slate-600">{ticket.robot?.name || ticket.robot?.product?.model || 'Robot'}</td>
                        <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                        <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(ticket.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={query.data.meta} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function TicketCard({ ticket }) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><Link to={`/tickets/${ticket.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{ticket.title}</Link><p className="mt-1 truncate text-sm text-slate-500">{ticket.robot?.name || ticket.robot?.product?.model || 'Robot'}</p></div>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3"><PriorityBadge priority={ticket.priority} /><span className="text-xs text-slate-500">{formatDate(ticket.updated_at)}</span></div>
    </article>
  )
}
