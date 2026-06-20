import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'

export default function ManageKb() {
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const query = useQuery({ queryKey: ['kb-manage', { term, page }], queryFn: () => apiClient.get('/kb-articles', { params: { q: term || undefined, page, per_page: 12 } }).then((response) => response.data.data) })
  const remove = useMutation({ mutationFn: (id) => apiClient.delete(`/kb-articles/${id}`), onSuccess: () => { toast.success('Article deleted'); setPendingDelete(null); client.invalidateQueries({ queryKey: ['kb-manage'] }) }, onError: () => toast.error('Unable to delete article') })
  const articles = query.data?.data || []

  return <AgentPage><PageHeader eyebrow="Knowledge operations" title="Manage knowledge base" description="Create, publish, and maintain client support documentation." actions={<Link to="/agent/kb/create" className="button button-primary"><Plus size={17} />Create article</Link>} />
    <form onSubmit={(event) => { event.preventDefault(); setTerm(search.trim()); setPage(1) }} className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm" placeholder="Search articles" /><button className="button button-secondary" type="submit">Search</button></form>
    <div className="mt-5">{query.isLoading && <LoadingState label="Loading articles..." />}{query.isError && <ErrorState message="Unable to load knowledge-base articles." onRetry={query.refetch} />}{query.isSuccess && articles.length === 0 && <EmptyState title="No articles found" description="Create the first article or adjust your search." action={<Link to="/agent/kb/create" className="button button-primary">Create article</Link>} />}{articles.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead><tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Family</th><th className="px-5 py-3">Publication</th><th className="px-5 py-3">Views</th><th className="px-5 py-3">Helpful</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-200">{articles.map((article) => <tr key={article.id}><td className="px-5 py-4"><Link to={`/agent/kb/edit/${article.id}`} className="font-semibold text-slate-900 hover:text-blue-600">{article.title}</Link><p className="mt-1 text-xs text-slate-500">/{article.slug}</p></td><td className="px-5 py-4 text-slate-600">{article.family?.name || 'All products'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${article.is_published ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{article.is_published ? 'Published' : 'Draft'}</span></td><td className="px-5 py-4 text-slate-600">{article.views}</td><td className="px-5 py-4 text-slate-600">{article.helpful_count}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/agent/kb/edit/${article.id}`} className="icon-button" aria-label={`Edit ${article.title}`} title="Edit article"><Edit3 size={16} /></Link><button type="button" className="icon-button text-red-600" onClick={() => setPendingDelete(article)} aria-label={`Delete ${article.title}`} title="Delete article"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><Pagination meta={query.data.meta} onPageChange={setPage} /></div>}</div>
    <ConfirmDialog isOpen={Boolean(pendingDelete)} title="Delete this article?" message={`“${pendingDelete?.title || ''}” will be permanently removed.`} confirmLabel="Delete article" busyLabel="Deleting..." isBusy={remove.isPending} onCancel={() => setPendingDelete(null)} onConfirm={() => remove.mutate(pendingDelete.id)} />
  </AgentPage>
}

function AgentPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
