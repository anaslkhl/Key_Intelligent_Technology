import { useQuery } from '@tanstack/react-query'
import { FileQuestion } from 'lucide-react'
import { getDocumentPreview } from '../../api/documents'
import { ErrorState, LoadingState } from '../common/QueryState'

export default function DocumentPreview({ document }) {
  const query = useQuery({ queryKey: ['document-preview', document.id], queryFn: () => getDocumentPreview(document.id) })

  if (query.isLoading) return <LoadingState label="Preparing preview..." />
  if (query.isError) return <ErrorState message="This preview is unavailable." onRetry={query.refetch} />

  const preview = query.data
  if (!preview.preview_url || document.document_type === 'presentation' || document.document_type === 'other') {
    return <div className="grid min-h-80 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-950"><div><FileQuestion className="mx-auto text-slate-400" size={38} /><h2 className="mt-4 !text-lg !font-semibold">Preview unavailable</h2><p className="mt-2 text-sm text-slate-500">Download this file to view it in its native application.</p></div></div>
  }

  if (document.document_type === 'image') return <div className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-zinc-800 dark:bg-zinc-950"><img src={preview.preview_url} alt={`Preview of ${document.title}`} className="max-h-[70vh] max-w-full object-contain" /></div>
  if (document.document_type === 'video') return <video controls preload="metadata" className="aspect-video w-full rounded-xl bg-black" src={preview.preview_url}>Your browser does not support video playback.</video>

  return <iframe title={`Preview of ${document.title}`} src={preview.preview_url} className="h-[70vh] min-h-[520px] w-full rounded-xl border border-slate-200 bg-white dark:border-zinc-800" />
}
