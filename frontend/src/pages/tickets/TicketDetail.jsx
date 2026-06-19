import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import { PriorityBadge, StatusBadge } from '../../components/common/Badge'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate, formatDateTime } from '../../utils/formatters'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [rating, setRating] = useState(5)
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm()
  const query = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiClient.get(`/tickets/${id}`).then((response) => response.data.data),
  })
  const messages = useMemo(
    () => [...(query.data?.messages || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [query.data?.messages],
  )

  const messageMutation = useMutation({
    mutationFn: (values) => apiClient.post(`/tickets/${id}/messages`, values),
    onSuccess: () => {
      toast.success('Message sent')
      reset()
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => {
      const apiError = parseApiError(error, 'Unable to send your message')
      applyFieldErrors(setError, apiError.fieldErrors)
      setError('root.server', { message: apiError.message })
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => apiClient.patch(`/tickets/${id}/close`, { csat_rating: rating }),
    onSuccess: () => {
      toast.success('Ticket closed. Thank you for your feedback.')
      setShowCloseModal(false)
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error) => toast.error(parseApiError(error, 'Unable to close ticket').message),
  })

  if (query.isLoading) return <Page><LoadingState label="Loading ticket..." /></Page>
  if (query.isError) return <Page><ErrorState message="Unable to load this ticket." onRetry={query.refetch} /></Page>

  const ticket = query.data

  return (
    <Page>
      <button type="button" onClick={() => navigate('/tickets')} className="mb-5 text-sm font-semibold text-blue-600 hover:text-blue-700">Back to tickets</button>

      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div>
          <h1 className="!text-3xl !font-bold !text-slate-900 sm:!text-4xl">{ticket.title}</h1>
          <p className="mt-3 text-sm text-slate-500">Created {formatDate(ticket.created_at)} · {ticket.category?.name || 'Support request'}</p>
        </div>
        {ticket.status !== 'closed' && (
          <button type="button" onClick={() => setShowCloseModal(true)} className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Close ticket</button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="!text-lg !font-semibold !text-slate-900">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.description}</p>
          </section>

          {ticket.status !== 'closed' && (
            <form onSubmit={handleSubmit((values) => messageMutation.mutate(values))} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="!text-lg !font-semibold !text-slate-900">Add message</h2>
              <p className="mt-1 text-sm text-slate-500">Continue the conversation with the support team.</p>
              {errors.root?.server && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}
              <textarea
                rows="4"
                className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Write your update..."
                {...register('content', { required: 'Message is required', maxLength: { value: 5000, message: 'Maximum 5000 characters' } })}
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
              <div className="mt-3 flex justify-end"><button type="submit" disabled={messageMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{messageMutation.isPending ? 'Sending...' : 'Send message'}</button></div>
            </form>
          )}

          <section>
            <h2 className="!text-xl !font-semibold !text-slate-900">Conversation</h2>
            <div className="mt-4 space-y-3">
              {messages.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No messages yet.</div>}
              {messages.map((message) => (
                <article key={message.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><strong className="text-sm text-slate-900">{message.user?.name || 'Support user'}</strong><span className="ml-2 text-xs capitalize text-slate-500">{message.user?.role}</span></div>
                    <time className="text-xs text-slate-500">{formatDateTime(message.created_at)}</time>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{message.content}</p>
                  {message.attachments?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{message.attachments.map((path) => <a key={path} href={`http://localhost:8000/storage/${path}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline">Attachment</a>)}</div>}
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="!text-base !font-semibold !text-slate-900">Ticket details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <Detail label="Robot" value={ticket.robot?.name || ticket.robot?.product?.model || 'Not available'} />
            <Detail label="Product" value={ticket.robot?.product?.name || 'Not available'} />
            <Detail label="Family" value={ticket.robot?.product?.family?.name || 'Not available'} />
            <Detail label="Assigned agent" value={ticket.assignee?.name || 'Awaiting assignment'} />
            {ticket.csat_rating && <Detail label="CSAT rating" value={`${ticket.csat_rating} / 5`} />}
          </dl>
        </aside>
      </div>

      {showCloseModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={() => !closeMutation.isPending && setShowCloseModal(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="csat-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="csat-title" className="!text-xl !font-semibold !text-slate-900">Close this ticket?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Rate your support experience before closing the conversation.</p>
            <div className="mt-5 flex justify-center gap-2" aria-label="Satisfaction rating">
              {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} className={`grid h-11 w-11 place-items-center rounded-lg border text-lg ${value <= rating ? 'border-amber-400 bg-amber-50 text-amber-500' : 'border-slate-300 text-slate-400'}`}>★</button>)}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowCloseModal(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{closeMutation.isPending ? 'Closing...' : 'Close ticket'}</button></div>
          </div>
        </div>
      )}
    </Page>
  )
}

function Detail({ label, value }) {
  return <div><dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt><dd className="mt-1 font-medium text-slate-700">{value}</dd></div>
}

function Page({ children }) {
  return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section>
}
