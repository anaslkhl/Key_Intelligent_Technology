import { useQuery } from '@tanstack/react-query'
import { Search, TicketCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAgentStaff, getAgentTickets, getTicketFamilies } from '../../api/tickets'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { useDebounce } from '../../hooks/useDebounce'
import { formatDate, formatDateTime } from '../../utils/formatters'

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting_client', label: 'Waiting client' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const priorities = [
  { value: '', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function AllTickets() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category_id: '',
    assigned_to: '',
    search: '',
    page: 1,
  })
  const [selectedId, setSelectedId] = useState(null)
  const debouncedSearch = useDebounce(filters.search, 350)

  const familiesQuery = useQuery({
    queryKey: ['ticket-families'],
    queryFn: getTicketFamilies,
  })

  const staffQuery = useQuery({
    queryKey: ['agent-staff'],
    queryFn: getAgentStaff,
  })

  const ticketsQuery = useQuery({
    queryKey: ['agent-tickets', { ...filters, search: debouncedSearch }],
    queryFn: () => getAgentTickets({
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      category_id: filters.category_id || undefined,
      assigned_to: filters.assigned_to || undefined,
      search: debouncedSearch || undefined,
      page: filters.page,
      per_page: 15,
    }),
  })

  const tickets = ticketsQuery.data?.data ?? []
  const categories = useMemo(() => {
    return (familiesQuery.data ?? []).flatMap((family) =>
      (family.ticket_categories ?? family.ticketCategories ?? []).map((category) => ({
        ...category,
        family_name: family.name,
      })),
    )
  }, [familiesQuery.data])

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0] ?? null

  useEffect(() => {
    if (!tickets.length) {
      setSelectedId(null)
      return
    }

    if (!tickets.some((ticket) => ticket.id === selectedId)) {
      setSelectedId(tickets[0].id)
    }
  }, [selectedId, tickets])

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }))
  }

  return (
    <AgentPage>
      <PageHeader
        eyebrow="Support operations"
        title="Ticket management"
        description="Review real client tickets from the database, filter the queue, and inspect ticket details."
      />

      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Search title
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search tickets..."
              className={`${inputClass} pl-9`}
            />
          </div>
        </label>

        <Filter label="Status" value={filters.status} options={statuses} onChange={(value) => updateFilter('status', value)} />
        <Filter label="Priority" value={filters.priority} options={priorities} onChange={(value) => updateFilter('priority', value)} />

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Category
          <select value={filters.category_id} onChange={(event) => updateFilter('category_id', event.target.value)} className={inputClass}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}{category.family_name ? ` · ${category.family_name}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Assigned to
          <select value={filters.assigned_to} onChange={(event) => updateFilter('assigned_to', event.target.value)} className={inputClass}>
            <option value="">All agents</option>
            {staffQuery.data?.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid min-h-[720px] gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <TicketQueue
          tickets={tickets}
          isLoading={ticketsQuery.isLoading}
          isError={ticketsQuery.isError}
          onRetry={ticketsQuery.refetch}
          selectedId={selectedId}
          onSelect={setSelectedId}
          total={ticketsQuery.data?.meta?.total ?? 0}
        />
        <TicketDetail ticket={selectedTicket} />
      </div>

      {ticketsQuery.data?.meta && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Pagination
            meta={ticketsQuery.data.meta}
            onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          />
        </div>
      )}
    </AgentPage>
  )
}

function TicketQueue({ tickets, total, selectedId, onSelect, isLoading, isError, onRetry }) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
          <TicketCheck size={18} className="text-blue-600" />
          Ticket Queue
        </h2>
        <p className="mt-1 text-sm text-slate-500">{total} real tickets found</p>
      </div>

      <div className="max-h-[650px] overflow-y-auto py-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        {isLoading && <div className="p-5"><LoadingState label="Loading ticket queue..." /></div>}
        {isError && <div className="p-5"><ErrorState message="Unable to load tickets." onRetry={onRetry} /></div>}
        {!isLoading && !isError && tickets.length === 0 && (
          <div className="p-5">
            <EmptyState title="No tickets found" description="No database tickets match the selected filters." />
          </div>
        )}
        {!isLoading && !isError && tickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => onSelect(ticket.id)}
            className={`block w-full border-l-4 px-5 py-4 text-left transition ${
              selectedId === ticket.id
                ? 'border-blue-600 bg-blue-50/80'
                : 'border-transparent bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar initials={initials(ticket.user?.name)} />
                <span className="truncate text-sm font-bold text-slate-950">{ticket.user?.name ?? 'Unknown client'}</span>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-400">{formatDate(ticket.created_at)}</span>
            </div>

            <p className="mt-3 truncate text-sm font-semibold text-slate-800">{ticket.title}</p>
            <p className="mt-1 truncate text-sm text-slate-500">
              {ticket.category?.name ?? 'Uncategorized'} · {ticket.robot?.name || ticket.robot?.product?.model || 'Robot not set'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.category?.name && <DepartmentPill label={ticket.category.name} />}
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}

function TicketDetail({ ticket }) {
  if (!ticket) {
    return (
      <section className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Select a ticket</h2>
          <p className="mt-2 text-sm text-slate-500">Choose a ticket from the queue to view database details.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="!text-2xl !font-bold text-slate-950">{ticket.title}</h1>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Created {formatDateTime(ticket.created_at)} by {ticket.user?.name ?? 'Unknown client'}
            </p>
          </div>
          <PriorityBadge priority={ticket.priority} />
        </div>
      </header>

      <div className="max-h-[650px] overflow-y-auto p-5 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] sm:p-6">
        <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar initials={initials(ticket.user?.name)} size="lg" />
              <div>
                <h2 className="text-base font-bold text-slate-950">{ticket.user?.name ?? 'Unknown client'}</h2>
                <p className="text-sm text-slate-500">{ticket.user?.email ?? 'No email available'}</p>
              </div>
            </div>
            <time className="text-sm font-medium text-slate-500">{formatDateTime(ticket.created_at)}</time>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <Detail label="Category" value={ticket.category?.name} />
            <Detail label="Robot" value={ticket.robot?.name || ticket.robot?.product?.model} />
            <Detail label="Product" value={ticket.robot?.product?.name || ticket.robot?.product?.model} />
            <Detail label="Assigned to" value={ticket.assigned_to?.name || 'Unassigned'} />
            <Detail label="Status" value={ticket.status?.replaceAll('_', ' ')} />
            <Detail label="Priority" value={ticket.priority} />
          </dl>

          <div className="mt-6">
            <Link
              to={`/agent/tickets/${ticket.id}`}
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open full conversation
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}

function Filter({ label, value, options, onChange }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold capitalize text-slate-800">{value || 'Not available'}</dd>
    </div>
  )
}

function Avatar({ initials, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm'

  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white ${sizeClass}`}>
      {initials}
    </span>
  )
}

function DepartmentPill({ label }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {label}
    </span>
  )
}

function initials(name) {
  if (!name) return '??'

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

function AgentPage({ children }) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}
