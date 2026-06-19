import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { parseApiError } from '../../api/errors'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { useAuth } from '../../contexts/auth'
import { formatDate } from '../../utils/formatters'

export default function KbDetail() {
  const { slug } = useParams()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['knowledge-base', slug], queryFn: () => apiClient.get(`/knowledge-base/${slug}`).then((response) => response.data.data) })
  const feedback = useMutation({
    mutationFn: (helpful) => apiClient.post(`/knowledge-base/${query.data.id}/feedback`, { helpful }),
    onSuccess: () => {
      toast.success('Thanks for your feedback')
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', slug] })
    },
    onError: (error) => toast.error(parseApiError(error, 'Unable to record feedback').message),
  })

  if (query.isLoading) return <Page><LoadingState label="Loading article..." /></Page>
  if (query.isError) return <Page><ErrorState message="Unable to load this article." onRetry={query.refetch} /></Page>

  const article = query.data
  return (
    <Page>
      <Link to="/knowledge-base" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Back to knowledge base</Link>
      <article className="mx-auto mt-5 max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase text-blue-600">{article.family?.name || 'General support'}</p>
          <h1 className="mt-3 !text-3xl !font-bold text-slate-900 sm:!text-4xl">{article.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span>{article.views} views</span><span>Updated {formatDate(article.updated_at)}</span>{article.product && <span>{article.product.model}</span>}</div>
        </div>
        <div className="kb-markdown mt-7"><ReactMarkdown>{article.content}</ReactMarkdown></div>
        <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h2 className="!text-base !font-semibold text-slate-900">Was this article helpful?</h2>
          {isAuthenticated ? (
            <div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={feedback.isPending} onClick={() => feedback.mutate(true)} className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">Yes, helpful</button><button type="button" disabled={feedback.isPending} onClick={() => feedback.mutate(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Not helpful</button></div>
          ) : <p className="mt-2 text-sm text-slate-600"><Link to="/login" className="font-semibold text-blue-600">Log in</Link> to leave feedback.</p>}
          <p className="mt-3 text-xs text-slate-500">{article.helpful_count} helpful · {article.not_helpful_count} not helpful</p>
        </div>
      </article>
    </Page>
  )
}

function Page({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
