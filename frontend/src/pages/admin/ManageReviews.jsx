import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Star, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'
import { AdminPage } from './shared'

export default function ManageReviews() {
  const client = useQueryClient(); const [page, setPage] = useState(1); const [rejecting, setRejecting] = useState(null)
  const query = useQuery({ queryKey: ['admin-reviews', page], queryFn: () => apiClient.get('/admin/reviews', { params: { page, per_page: 15 } }).then((response) => response.data) })
  const moderate = useMutation({ mutationFn: ({ id, action }) => apiClient.patch(`/admin/reviews/${id}`, { action }), onSuccess: (_, values) => { toast.success(`Review ${values.action}d`); setRejecting(null); client.invalidateQueries({ queryKey: ['admin-reviews'] }); client.invalidateQueries({ queryKey: ['admin-stats'] }) }, onError: () => toast.error('Unable to moderate review') })
  const reviews = query.data?.data || []

  return <AdminPage><PageHeader eyebrow="Administration" title="Review moderation" description="Approve client feedback before it appears publicly." />
    <div className="mt-6">{query.isLoading && <LoadingState label="Loading pending reviews..." />}{query.isError && <ErrorState message="Unable to load pending reviews." onRetry={query.refetch} />}{query.isSuccess && reviews.length === 0 && <EmptyState title="Moderation queue is clear" description="New client reviews will appear here for approval." />}{reviews.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Robot</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Comment</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-200">{reviews.map((review) => <tr key={review.id}><td className="px-5 py-4"><span className="inline-flex items-center gap-1 font-semibold text-amber-600"><Star size={16} fill="currentColor" />{review.rating}</span></td><td className="px-5 py-4 text-slate-700">{review.robot?.name || review.robot?.product?.model}</td><td className="px-5 py-4 text-slate-600">{review.user?.name}</td><td className="max-w-sm px-5 py-4"><p className="line-clamp-2 text-slate-600">{review.comment || review.title || 'No comment provided'}</p></td><td className="px-5 py-4 text-slate-500">{formatDate(review.created_at)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => moderate.mutate({ id: review.id, action: 'approve' })} className="button button-success button-sm"><Check size={15} />Approve</button><button type="button" onClick={() => setRejecting(review)} className="button button-danger button-sm"><X size={15} />Reject</button></div></td></tr>)}</tbody></table></div><Pagination meta={query.data.meta} onPageChange={setPage} /></div>}</div>
    <ConfirmDialog isOpen={Boolean(rejecting)} title="Reject this review?" message="The review will be permanently removed from the moderation queue." confirmLabel="Reject review" busyLabel="Rejecting..." isBusy={moderate.isPending} onCancel={() => setRejecting(null)} onConfirm={() => moderate.mutate({ id: rejecting.id, action: 'reject' })} />
  </AdminPage>
}
