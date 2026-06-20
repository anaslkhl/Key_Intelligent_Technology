import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

const statuses = ['', 'new', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed']
const priorities = ['', 'urgent', 'high', 'medium', 'low']

export default function AllTickets() {
  const client = useQueryClient()
  const [filters, setFilters] = useState({ status: '', priority: '', assigned_to: '', page: 1 })
  const staffQuery = useQuery({ queryKey: ['agent-staff'], queryFn: () => apiClient.get('/agent/staff').then((response) => response.data.data) })
  const ticketsQuery = useQuery({ queryKey: ['agent-tickets', filters], queryFn: () => apiClient.get('/agent/tickets', { params: { ...filters, status: filters.status || undefined, priority: filters.priority || undefined, assigned_to: filters.assigned_to || undefined, per_page: 12 } }).then((response) => response.data) })
  const assign = useMutation({ mutationFn: ({ id, assigned_to }) => apiClient.patch(`/agent/tickets/${id}`, { assigned_to: assigned_to || null }), onSuccess: () => { toast.success('Assignment updated'); client.invalidateQueries({ queryKey: ['agent-tickets'] }) }, onError: () => toast.error('Unable to update assignment') })
  const tickets = ticketsQuery.data?.data || []
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }))

  return <AgentPage><PageHeader eyebrow="Support operations" title="All tickets" description="Filter, review, and assign incoming client requests." />
    <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
      <Filter label="Status" value={filters.status} options={statuses} onChange={(value) => updateFilter('status', value)} />
      <Filter label="Priority" value={filters.priority} options={priorities} onChange={(value) => updateFilter('priority', value)} />
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Assigned to<select value={filters.assigned_to} onChange={(event) => updateFilter('assigned_to', event.target.value)} className={inputClass}><option value="">All agents</option>{staffQuery.data?.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
    </div>
    <div className="mt-5">{ticketsQuery.isLoading && <LoadingState label="Loading ticket queue..." />}{ticketsQuery.isError && <ErrorState message="Unable to load tickets." onRetry={ticketsQuery.refetch} />}{ticketsQuery.isSuccess && tickets.length === 0 && <EmptyState title="No tickets found" description="No requests match the selected filters." />}
      {tickets.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="divide-y divide-slate-200 lg:hidden">{tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} staff={staffQuery.data || []} onAssign={(assigned_to) => assign.mutate({ id: ticket.id, assigned_to })} />)}</div><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr><th className="px-5 py-3">Ticket</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Assigned to</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-200">{tickets.map((ticket) => <tr key={ticket.id}><td className="px-5 py-4"><Link to={`/agent/tickets/${ticket.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{ticket.title}</Link></td><td className="px-5 py-4 text-slate-600">{ticket.user?.name}</td><td className="px-5 py-4"><PriorityBadge priority={ticket.priority} /></td><td className="px-5 py-4"><StatusBadge status={ticket.status} /></td><td className="px-5 py-4"><select aria-label={`Assign ${ticket.title}`} value={ticket.assigned_to?.id || ''} onChange={(event) => assign.mutate({ id: ticket.id, assigned_to: event.target.value })} className="h-9 max-w-44 rounded-lg border px-2 text-sm"><option value="">Unassigned</option>{staffQuery.data?.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></td><td className="px-5 py-4 text-slate-500">{formatDate(ticket.created_at)}</td></tr>)}</tbody></table></div><Pagination meta={ticketsQuery.data.meta} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} /></div>}
    </div>
  </AgentPage>
}

function Filter({ label, value, options, onChange }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>{options.map((option) => <option key={option} value={option}>{option ? option.replaceAll('_', ' ') : `All ${label.toLowerCase()} levels`}</option>)}</select></label> }
function TicketCard({ ticket, staff, onAssign }) { return <article className="p-4"><div className="flex items-start justify-between gap-3"><div><Link to={`/agent/tickets/${ticket.id}`} className="font-semibold text-slate-900">{ticket.title}</Link><p className="mt-1 text-sm text-slate-500">{ticket.user?.name} · {formatDate(ticket.created_at)}</p></div><StatusBadge status={ticket.status} /></div><div className="mt-4 flex flex-wrap items-center gap-3"><PriorityBadge priority={ticket.priority} /><select aria-label="Assign ticket" value={ticket.assigned_to?.id || ''} onChange={(event) => onAssign(event.target.value)} className="h-9 min-w-40 flex-1 rounded-lg border px-2 text-sm"><option value="">Unassigned</option>{staff.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div></article> }
const inputClass = 'h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none'
function AgentPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
