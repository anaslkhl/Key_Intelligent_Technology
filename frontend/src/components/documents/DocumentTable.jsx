import { Edit3, KeyRound, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatters'

export default function DocumentTable({ documents, mode = 'agent', onDelete, onPublish, onPermissions }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111111]">
      <div className="divide-y divide-slate-200 dark:divide-zinc-800 lg:hidden">{documents.map((document) => <MobileRow key={document.id} document={document} mode={mode} onDelete={onDelete} onPublish={onPublish} onPermissions={onPermissions} />)}</div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead><tr><th className="px-5 py-3">Document</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Visibility</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Updated</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">{documents.map((document) => <tr key={document.id}><td className="px-5 py-4"><strong className="block max-w-xs truncate text-slate-900 dark:text-white">{document.title}</strong><span className="mt-1 block text-xs text-slate-500">v{document.version}</span></td><td className="px-5 py-4 text-slate-600 dark:text-zinc-400">{document.category?.name || '—'}</td><td className="px-5 py-4"><TypeBadge type={document.document_type} /></td><td className="px-5 py-4 capitalize text-slate-600 dark:text-zinc-400">{document.visibility}</td><td className="px-5 py-4"><StatusBadge published={document.is_published} /></td><td className="px-5 py-4 text-slate-500">{formatDate(document.updated_at)}</td><td className="px-5 py-4"><Actions document={document} mode={mode} onDelete={onDelete} onPublish={onPublish} onPermissions={onPermissions} /></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

function Actions({ document, mode, onDelete, onPublish, onPermissions }) {
  return <div className="flex justify-end gap-2"><Link to={`/agent/documents/${document.id}/edit`} className="icon-button" title="Edit document" aria-label={`Edit ${document.title}`}><Edit3 size={16} /></Link>{!document.is_published && <button type="button" onClick={() => onPublish(document)} className="icon-button text-green-600" title="Publish document" aria-label={`Publish ${document.title}`}><Send size={16} /></button>}{mode === 'admin' && <><button type="button" onClick={() => onPermissions(document)} className="icon-button text-blue-600" title="Manage permissions" aria-label={`Manage permissions for ${document.title}`}><KeyRound size={16} /></button><button type="button" onClick={() => onDelete(document)} className="icon-button text-red-600" title="Delete document" aria-label={`Delete ${document.title}`}><Trash2 size={16} /></button></>}</div>
}

function MobileRow({ document, mode, onDelete, onPublish, onPermissions }) {
  return <article className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate text-slate-900 dark:text-white">{document.title}</strong><p className="mt-1 text-xs text-slate-500">{document.category?.name || 'Uncategorized'} · {document.document_type}</p></div><StatusBadge published={document.is_published} /></div><div className="mt-4 flex items-center justify-between"><span className="text-xs capitalize text-slate-500">{document.visibility} · {formatDate(document.updated_at)}</span><Actions document={document} mode={mode} onDelete={onDelete} onPublish={onPublish} onPermissions={onPermissions} /></div></article>
}

function StatusBadge({ published }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${published ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>{published ? 'Published' : 'Draft'}</span> }
function TypeBadge({ type }) { return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{type}</span> }
