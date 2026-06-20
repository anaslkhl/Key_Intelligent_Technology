import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { formatDate } from '../../utils/formatters'

export default function ManageForum() {
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)
  const query = useQuery({ queryKey: ['forum-manage', page], queryFn: () => apiClient.get('/forum/questions', { params: { page, per_page: 15 } }).then((response) => response.data) })
  const remove = useMutation({ mutationFn: (id) => apiClient.delete(`/forum/questions/${id}`), onSuccess: () => { toast.success('Question deleted'); setPendingDelete(null); client.invalidateQueries({ queryKey: ['forum-manage'] }) }, onError: (error) => toast.error(error.response?.data?.message || 'Unable to delete question') })
  const questions = query.data?.data || []

  return <AgentPage><PageHeader eyebrow="Community moderation" title="Manage forum" description="Review client questions and remove inappropriate content." />
    <div className="mt-6">{query.isLoading && <LoadingState label="Loading community questions..." />}{query.isError && <ErrorState message="Unable to load forum questions." onRetry={query.refetch} />}{query.isSuccess && questions.length === 0 && <EmptyState title="No forum questions" description="Community questions will appear here." />}{questions.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr><th className="px-5 py-3">Question</th><th className="px-5 py-3">Author</th><th className="px-5 py-3">Answers</th><th className="px-5 py-3">Created</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-200">{questions.map((question) => <tr key={question.id}><td className="px-5 py-4"><strong className="text-slate-900">{question.title}</strong>{question.is_solved && <span className="ml-2 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Solved</span>}</td><td className="px-5 py-4 text-slate-600">{question.user?.name}</td><td className="px-5 py-4 text-slate-600">{question.answers_count}</td><td className="px-5 py-4 text-slate-500">{formatDate(question.created_at)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/forum/${question.id}`} className="icon-button" aria-label="View question" title="View question"><Eye size={16} /></Link><button type="button" className="icon-button text-red-600" onClick={() => setPendingDelete(question)} aria-label="Delete question" title="Delete question"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><Pagination meta={query.data.meta} onPageChange={setPage} /></div>}</div>
    <ConfirmDialog isOpen={Boolean(pendingDelete)} title="Delete this question?" message={`“${pendingDelete?.title || ''}” and its answers will be permanently removed.`} confirmLabel="Delete question" busyLabel="Deleting..." isBusy={remove.isPending} onCancel={() => setPendingDelete(null)} onConfirm={() => remove.mutate(pendingDelete.id)} />
  </AgentPage>
}

function AgentPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
