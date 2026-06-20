import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'
import { AdminPage, featureStatuses, inputClass } from './shared'

export default function ManageFeatures() {
  const client = useQueryClient(); const [page, setPage] = useState(1); const [status, setStatus] = useState('')
  const query = useQuery({ queryKey: ['admin-features', { page, status }], queryFn: () => apiClient.get('/admin/feature-requests', { params: { page, status: status || undefined, per_page: 15 } }).then((response) => response.data) })
  const update = useMutation({ mutationFn: ({ id, status }) => apiClient.patch(`/admin/feature-requests/${id}`, { status }), onSuccess: () => { toast.success('Feature status updated'); client.invalidateQueries({ queryKey: ['admin-features'] }); client.invalidateQueries({ queryKey: ['admin-analytics'] }) }, onError: () => toast.error('Unable to update feature status') })
  const features = query.data?.data || []

  return <AdminPage><PageHeader eyebrow="Administration" title="Feature roadmap" description="Prioritize client ideas and communicate delivery progress." />
    <div className="mt-6 max-w-xs rounded-lg border border-slate-200 bg-white p-4"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">Status<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className={inputClass}><option value="">All statuses</option>{featureStatuses.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select></label></div>
    <div className="mt-5">{query.isLoading && <LoadingState label="Loading feature requests..." />}{query.isError && <ErrorState message="Unable to load feature requests." onRetry={query.refetch} />}{query.isSuccess && features.length === 0 && <EmptyState title="No feature requests" description="No ideas match this status." />}{features.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr><th className="px-5 py-3">Feature</th><th className="px-5 py-3">Submitted by</th><th className="px-5 py-3">Votes</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-200">{features.map((feature) => <tr key={feature.id}><td className="max-w-md px-5 py-4"><strong className="text-slate-900">{feature.title}</strong><p className="mt-1 line-clamp-1 text-xs text-slate-500">{feature.description}</p></td><td className="px-5 py-4 text-slate-600">{feature.user?.name}</td><td className="px-5 py-4 font-semibold text-slate-700">{feature.upvotes_count}</td><td className="px-5 py-4"><select aria-label={`Status for ${feature.title}`} value={feature.status} onChange={(event) => update.mutate({ id: feature.id, status: event.target.value })} className="h-9 rounded-lg border px-2 text-sm">{featureStatuses.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}</select></td><td className="px-5 py-4 text-slate-500">{formatDate(feature.created_at)}</td></tr>)}</tbody></table></div><Pagination meta={query.data.meta} onPageChange={setPage} /></div>}</div>
  </AdminPage>
}
