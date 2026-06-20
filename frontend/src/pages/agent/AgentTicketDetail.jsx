import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LockKeyhole, MessageSquareText } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDateTime } from '../../utils/formatters'

const statuses = ['new', 'open', 'in_progress', 'waiting_client', 'resolved', 'closed']

export default function AgentTicketDetail() {
  const { id } = useParams()
  const client = useQueryClient()
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({ defaultValues: { content: '', is_internal: false } })
  const isInternal = useWatch({ control, name: 'is_internal' })
  const query = useQuery({ queryKey: ['agent-ticket', id], queryFn: () => apiClient.get(`/agent/tickets/${id}`).then((response) => response.data.data) })
  const staffQuery = useQuery({ queryKey: ['agent-staff'], queryFn: () => apiClient.get('/agent/staff').then((response) => response.data.data) })
  const update = useMutation({ mutationFn: (values) => apiClient.patch(`/agent/tickets/${id}`, values), onSuccess: () => { toast.success('Ticket updated'); client.invalidateQueries({ queryKey: ['agent-ticket', id] }); client.invalidateQueries({ queryKey: ['agent-tickets'] }) }, onError: () => toast.error('Unable to update ticket') })
  const message = useMutation({ mutationFn: (values) => apiClient.post(`/tickets/${id}/messages`, values), onSuccess: () => { toast.success('Message added'); reset(); client.invalidateQueries({ queryKey: ['agent-ticket', id] }) }, onError: (error) => toast.error(error.response?.data?.message || 'Unable to add message') })

  if (query.isLoading) return <AgentPage><LoadingState label="Loading ticket conversation..." /></AgentPage>
  if (query.isError) return <AgentPage><ErrorState message="Unable to load this ticket." onRetry={query.refetch} /></AgentPage>
  const ticket = query.data

  return <AgentPage>
    <Link to="/agent/tickets" className="text-sm font-semibold text-blue-600">Back to ticket queue</Link>
    <div className="mt-5 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex flex-wrap gap-2"><PriorityBadge priority={ticket.priority} /><StatusBadge status={ticket.status} /></div><h1 className="mt-4 !text-3xl !font-bold text-slate-900 lg:!text-4xl">{ticket.title}</h1><p className="mt-2 text-sm text-slate-500">Opened by {ticket.user?.name} · {formatDateTime(ticket.created_at)}</p></div><div className="grid gap-3 sm:grid-cols-2 lg:w-[440px]"><Control label="Status"><select value={ticket.status} onChange={(event) => update.mutate({ status: event.target.value })} className={inputClass}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></Control><Control label="Assigned to"><select value={ticket.assigned_to?.id || ''} onChange={(event) => update.mutate({ assigned_to: event.target.value || null })} className={inputClass}><option value="">Unassigned</option>{staffQuery.data?.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></Control></div></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6"><section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"><h2 className="!text-lg !font-semibold text-slate-900">Issue description</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.description}</p></section>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="!text-lg !font-semibold text-slate-900">Conversation</h2></div><div className="grid gap-4 p-4 sm:p-6">{ticket.messages?.length ? ticket.messages.map((item) => <article key={item.id} className={`rounded-lg border p-4 ${item.is_internal ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><strong className="text-sm text-slate-900">{item.user?.name}</strong>{item.is_internal && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800"><LockKeyhole size={12} />Internal</span>}</div><span className="text-xs text-slate-500">{formatDateTime(item.created_at)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.content || item.message}</p></article>) : <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p>}</div></section>
        <form onSubmit={handleSubmit((values) => message.mutate(values))} className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="!text-lg !font-semibold text-slate-900">Add message</h2><label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" className="h-4 w-4" {...register('is_internal')} />Internal note</label></div><textarea rows="5" className="mt-4 w-full rounded-lg border p-3 text-sm" placeholder={isInternal ? 'Visible only to support staff' : 'Reply to the client'} {...register('content', { required: 'Message is required', maxLength: { value: 5000, message: 'Maximum 5000 characters' } })} />{errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}<div className="mt-4 flex justify-end"><button type="submit" disabled={isSubmitting || message.isPending} className="button button-primary"><MessageSquareText size={17} />{isInternal ? 'Add internal note' : 'Send reply'}</button></div></form>
      </div>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5"><h2 className="!text-lg !font-semibold text-slate-900">Ticket details</h2><dl className="mt-5 grid gap-4 text-sm"><Detail label="Client" value={ticket.user?.name} /><Detail label="Company" value={ticket.user?.company_name} /><Detail label="Robot" value={ticket.robot?.name || ticket.robot?.product?.model} /><Detail label="Category" value={ticket.category?.name} /><Detail label="CSAT" value={ticket.csat_rating ? `${ticket.csat_rating}/5` : 'Not submitted'} /></dl></aside>
    </div>
  </AgentPage>
}

function Control({ label, children }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700">{label}{children}</label> }
function Detail({ label, value }) { return <div className="flex justify-between gap-4 border-b border-slate-200 pb-3"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-900">{value || 'Not available'}</dd></div> }
const inputClass = 'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900'
function AgentPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
