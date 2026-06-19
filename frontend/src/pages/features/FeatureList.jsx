import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { parseApiError } from '../../api/errors'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

const statuses = ['', 'pending', 'under_review', 'planned', 'in_development', 'shipped', 'declined']
const statusStyles = { pending: 'bg-slate-100 text-slate-700', under_review: 'bg-amber-50 text-amber-700', planned: 'bg-blue-50 text-blue-700', in_development: 'bg-violet-50 text-violet-700', shipped: 'bg-green-50 text-green-700', declined: 'bg-red-50 text-red-700' }

export default function FeatureList() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['feature-requests', { status, page }], queryFn: () => apiClient.get('/feature-requests', { params: { status: status || undefined, page, per_page: 9 } }).then((response) => response.data) })
  const vote = useMutation({
    mutationFn: (id) => apiClient.post(`/feature-requests/${id}/vote`),
    onSuccess: () => { toast.success('Vote recorded'); queryClient.invalidateQueries({ queryKey: ['feature-requests'] }) },
    onError: (error) => toast.error(parseApiError(error, 'Unable to vote').message),
  })
  const features = query.data?.data || []

  return (
    <Page>
      <PageHeader eyebrow="Product roadmap" title="Feature requests" description="Vote for improvements and submit ideas for KIT Robotics products." actions={<Link to="/features/submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Submit idea</Link>} />
      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between"><label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:w-64">Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className={inputClass}>{statuses.map((item) => <option key={item || 'all'} value={item}>{item ? item.replaceAll('_', ' ') : 'All statuses'}</option>)}</select></label><p className="text-sm text-slate-500">{query.data?.meta?.total || 0} ideas</p></div>
      <div className="mt-5">
        {query.isLoading && <LoadingState label="Loading feature requests..." />}
        {query.isError && <ErrorState message="Unable to load feature requests." onRetry={query.refetch} />}
        {query.isSuccess && features.length === 0 && <EmptyState title="No feature requests found" description="Submit an idea or choose another status." />}
        {features.length > 0 && <><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{features.map((feature) => <article key={feature.id} className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="text-xs font-bold uppercase text-blue-600">{feature.category || 'Product idea'}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[feature.status] || statusStyles.pending}`}>{feature.status.replaceAll('_', ' ')}</span></div><h2 className="mt-4 !text-xl !font-semibold !text-slate-900">{feature.title}</h2><p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{feature.description}</p><div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-4"><div><strong className="block text-xl text-slate-900">{feature.upvotes_count}</strong><span className="text-xs text-slate-500">votes · {formatDate(feature.created_at)}</span></div><button type="button" disabled={vote.isPending} onClick={() => vote.mutate(feature.id)} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">Vote</button></div></article>)}</div><div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white"><Pagination meta={query.data.meta} onPageChange={setPage} /></div></>}
      </div>
    </Page>
  )
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm capitalize text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
function Page({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
