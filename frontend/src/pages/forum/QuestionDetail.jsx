import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { useAuth } from '../../contexts/auth'
import { formatDateTime } from '../../utils/formatters'

export default function QuestionDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm()
  const query = useQuery({ queryKey: ['forum-question', id], queryFn: () => apiClient.get(`/forum/questions/${id}`).then((response) => response.data.data) })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['forum-question', id] })
  const answerMutation = useMutation({
    mutationFn: (values) => apiClient.post(`/forum/questions/${id}/answers`, values),
    onSuccess: () => { toast.success('Answer posted'); reset(); refresh() },
    onError: (error) => { const apiError = parseApiError(error, 'Unable to post answer'); applyFieldErrors(setError, apiError.fieldErrors); setError('root.server', { message: apiError.message }) },
  })
  const voteMutation = useMutation({
    mutationFn: ({ answerId, vote }) => apiClient.post(`/forum/answers/${answerId}/vote`, { vote }),
    onSuccess: () => { toast.success('Vote recorded'); refresh() },
    onError: (error) => toast.error(parseApiError(error, 'Unable to vote').message),
  })
  const acceptMutation = useMutation({
    mutationFn: (answerId) => apiClient.post(`/forum/answers/${answerId}/accept`),
    onSuccess: () => { toast.success('Answer accepted'); refresh() },
    onError: (error) => toast.error(parseApiError(error, 'Unable to accept answer').message),
  })

  if (query.isLoading) return <Page><LoadingState label="Loading discussion..." /></Page>
  if (query.isError) return <Page><ErrorState message="Unable to load this question." onRetry={query.refetch} /></Page>

  const question = query.data
  const isAuthor = user?.id === question.user?.id
  const answers = [...(question.answers || [])].sort((a, b) => Number(b.is_accepted) - Number(a.is_accepted))

  return (
    <Page>
      <Link to="/forum" className="text-sm font-semibold text-blue-600">Back to forum</Link>
      <article className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-2">{question.is_solved && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Solved</span>}<span className="text-sm text-slate-500">Asked by {question.user?.name} · {formatDateTime(question.created_at)}</span></div>
        <h1 className="mt-4 !text-3xl !font-bold !text-slate-900 sm:!text-4xl">{question.title}</h1>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">{question.content}</p>
        <div className="mt-5 flex flex-wrap gap-2">{question.tags.map((tag) => <span key={tag} className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{tag}</span>)}</div>
        <p className="mt-5 text-sm text-slate-500">{question.upvotes} upvotes · {question.downvotes} downvotes</p>
      </article>

      <section className="mt-8">
        <h2 className="!text-xl !font-semibold !text-slate-900">{question.answers_count} answers</h2>
        <div className="mt-4 space-y-4">
          {answers.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No answers yet.</div>}
          {answers.map((answer) => (
            <article key={answer.id} className={`rounded-lg border bg-white p-5 shadow-sm ${answer.is_accepted ? 'border-green-300 ring-1 ring-green-200' : 'border-slate-200'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm text-slate-900">{answer.user?.name}</strong><span className="ml-2 text-xs text-slate-500">{formatDateTime(answer.created_at)}</span></div>{answer.is_accepted && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Accepted solution</span>}</div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{answer.content}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {isAuthenticated && <><button type="button" onClick={() => voteMutation.mutate({ answerId: answer.id, vote: 'up' })} disabled={voteMutation.isPending} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Upvote {answer.upvotes}</button><button type="button" onClick={() => voteMutation.mutate({ answerId: answer.id, vote: 'down' })} disabled={voteMutation.isPending} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Downvote {answer.downvotes}</button></>}
                {isAuthor && !answer.is_accepted && <button type="button" onClick={() => acceptMutation.mutate(answer.id)} disabled={acceptMutation.isPending} className="ml-auto rounded-lg border border-green-300 px-3 py-1.5 text-sm font-semibold text-green-700 hover:bg-green-50">Accept answer</button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="!text-xl !font-semibold !text-slate-900">Add your answer</h2>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit((values) => answerMutation.mutate(values))} className="mt-4">
            {errors.root?.server && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}
            <textarea rows="6" placeholder="Share a clear, useful answer..." className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" {...register('content', { required: 'Answer is required', maxLength: { value: 10000, message: 'Maximum 10000 characters' } })} />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            <div className="mt-3 flex justify-end"><button type="submit" disabled={answerMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{answerMutation.isPending ? 'Posting...' : 'Post answer'}</button></div>
          </form>
        ) : <p className="mt-3 text-sm text-slate-600"><Link to="/login" className="font-semibold text-blue-600">Log in</Link> to answer this question.</p>}
      </section>
    </Page>
  )
}

function Page({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">{children}</div></section> }
