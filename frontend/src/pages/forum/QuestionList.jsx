import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { useAuth } from '../../contexts/auth'
import { formatDate } from '../../utils/formatters'

export default function QuestionList() {
  const { isAuthenticated } = useAuth()
  const [draftTag, setDraftTag] = useState('')
  const [tag, setTag] = useState('')
  const [solved, setSolved] = useState('')
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['forum-questions', { tag, solved, page }],
    queryFn: () => apiClient.get('/forum/questions', { params: { tag: tag || undefined, solved: solved === '' ? undefined : solved, page, per_page: 10 } }).then((response) => response.data),
  })
  const questions = query.data?.data || []

  return (
    <Page>
      <PageHeader eyebrow="KIT community" title="Community forum" description="Ask product questions and learn from other KIT Robotics users." actions={isAuthenticated ? <Link to="/forum/ask" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Ask question</Link> : <Link to="/login" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Log in to ask</Link>} />
      <form onSubmit={(event) => { event.preventDefault(); setTag(draftTag.trim()); setPage(1) }} className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_230px_auto]">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Tag<input value={draftTag} onChange={(event) => setDraftTag(event.target.value)} placeholder="e.g. cleaning" className={inputClass} /></label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Status<select value={solved} onChange={(event) => { setSolved(event.target.value); setPage(1) }} className={inputClass}><option value="">All questions</option><option value="1">Solved</option><option value="0">Unsolved</option></select></label>
        <button type="submit" className="self-end rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Apply filters</button>
      </form>
      <div className="mt-5">
        {query.isLoading && <LoadingState label="Loading questions..." />}
        {query.isError && <ErrorState message="Unable to load forum questions." onRetry={query.refetch} />}
        {query.isSuccess && questions.length === 0 && <EmptyState title="No questions found" description="Try another filter or start a new discussion." />}
        {questions.length > 0 && <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-200">{questions.map((question) => <QuestionCard key={question.id} question={question} />)}</div><Pagination meta={query.data.meta} onPageChange={setPage} /></div>}
      </div>
    </Page>
  )
}

function QuestionCard({ question }) {
  return <article className="p-4 hover:bg-slate-50 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex gap-5 text-center text-xs text-slate-500 sm:w-28 sm:shrink-0 sm:flex-col sm:gap-2"><span><strong className="block text-base text-slate-800">{question.upvotes - question.downvotes}</strong>votes</span><span><strong className="block text-base text-slate-800">{question.answers_count}</strong>answers</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2">{question.is_solved && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Solved</span>}<span className="text-xs text-slate-400">{formatDate(question.created_at)}</span></div><h2 className="mt-2 !text-lg !font-semibold text-slate-900"><Link to={`/forum/${question.id}`} className="hover:text-blue-600">{question.title}</Link></h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{question.content}</p><div className="mt-3 flex flex-wrap gap-2">{question.tags.map((item) => <span key={item} className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{item}</span>)}</div></div></div></article>
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
function Page({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
