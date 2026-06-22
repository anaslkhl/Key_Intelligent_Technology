import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import { getDocuments } from '../../api/documents'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import DocumentPermissionEditor from '../../components/documents/DocumentPermissionEditor'
import DocumentTable from '../../components/documents/DocumentTable'

const inputClass = 'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-[#111111]'

export default function ManageDocuments({ mode = 'agent' }) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [permissionDocument, setPermissionDocument] = useState(null)
  const query = useQuery({ queryKey: ['manage-documents', mode, { page, search, status }], queryFn: () => getDocuments({ page, per_page: 15, search: search || undefined, is_published: status === '' ? undefined : status === 'published' }) })
  const publish = useMutation({ mutationFn: (document) => apiClient.patch(`/documents/${document.id}/publish`), onSuccess: () => { toast.success('Document published'); queryClient.invalidateQueries({ queryKey: ['manage-documents'] }); queryClient.invalidateQueries({ queryKey: ['documents'] }) }, onError: (error) => toast.error(error.response?.data?.message || 'Unable to publish document') })
  const remove = useMutation({ mutationFn: (document) => apiClient.delete(`/documents/${document.id}`), onSuccess: () => { toast.success('Document deleted'); setPendingDelete(null); queryClient.invalidateQueries({ queryKey: ['manage-documents'] }) }, onError: (error) => toast.error(error.response?.data?.message || 'Unable to delete document') })
  const documents = query.data?.data || []

  return <StaffPage><PageHeader eyebrow={mode === 'admin' ? 'Administration' : 'Document operations'} title={mode === 'admin' ? 'Document administration' : 'Manage documents'} description="Upload, organize, publish, and maintain resources across the KIT product portfolio." actions={<Link to="/agent/documents/create" className="button button-primary"><Plus size={17} />Create document</Link>} />
    <form onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch.trim()); setPage(1) }} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#111111] sm:grid-cols-[minmax(0,1fr)_180px_auto]"><label className="relative"><span className="sr-only">Search documents</span><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} className={`${inputClass} w-full pl-9`} placeholder="Search documents" /></label><label><span className="sr-only">Publication status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className={`${inputClass} w-full`}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></label><button type="submit" className="button button-secondary">Search</button></form>
    <div className="mt-5">{query.isLoading && <LoadingState label="Loading documents..." />}{query.isError && <ErrorState message="Unable to load managed documents." onRetry={query.refetch} />}{query.isSuccess && documents.length === 0 && <EmptyState title="No documents found" description="Create a document or adjust the current filters." action={<Link to="/agent/documents/create" className="button button-primary">Create document</Link>} />}{documents.length > 0 && <><DocumentTable documents={documents} mode={mode} onPublish={publish.mutate} onDelete={setPendingDelete} onPermissions={setPermissionDocument} /><Pagination meta={query.data.meta} onPageChange={setPage} /></>}</div>
    <ConfirmDialog isOpen={Boolean(pendingDelete)} title="Delete this document?" message={`“${pendingDelete?.title || ''}” will be removed from the library. Its uploaded file and version history are retained.`} confirmLabel="Delete document" busyLabel="Deleting..." isBusy={remove.isPending} onCancel={() => setPendingDelete(null)} onConfirm={() => remove.mutate(pendingDelete)} />
    {permissionDocument && <DocumentPermissionEditor document={permissionDocument} onClose={() => setPermissionDocument(null)} />}
  </StaffPage>
}

export function StaffPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900 dark:bg-black dark:text-white"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
