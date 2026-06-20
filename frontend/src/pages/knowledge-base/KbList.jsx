import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'

export default function KbList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('q') || ''
  const [draftSearch, setDraftSearch] = useState(initialSearch)
  const [search, setSearch] = useState(initialSearch)
  const [familyId, setFamilyId] = useState('')
  const [page, setPage] = useState(1)
  const familiesQuery = useQuery({ queryKey: ['families'], queryFn: () => apiClient.get('/families').then((response) => response.data.data) })
  const query = useQuery({
    queryKey: ['knowledge-base', { search, familyId, page }],
    queryFn: () => apiClient.get('/knowledge-base', { params: { q: search || undefined, family_id: familyId || undefined, page, per_page: 9 } }).then((response) => response.data.data),
  })
  const articles = query.data?.data || []

  const submitSearch = (event) => {
    event.preventDefault()
    setSearch(draftSearch.trim())
    setSearchParams(draftSearch.trim() ? { q: draftSearch.trim() } : {})
    setPage(1)
  }

  return (
    <SelfServicePage>
      <PageHeader eyebrow="Self-service support" title="Knowledge base" description="Search product guidance, maintenance instructions, and troubleshooting articles." />

      <form onSubmit={submitSearch} className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_260px_auto]">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Search<input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search articles..." className={inputClass} /></label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">Product family<select value={familyId} onChange={(event) => { setFamilyId(event.target.value); setPage(1) }} className={inputClass}><option value="">All families</option>{(familiesQuery.data || []).map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</select></label>
        <button type="submit" className="self-end rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Search</button>
      </form>

      <div className="mt-6">
        {query.isLoading && <LoadingState label="Searching knowledge base..." />}
        {query.isError && <ErrorState message="Unable to load knowledge-base articles." onRetry={query.refetch} />}
        {query.isSuccess && articles.length === 0 && <EmptyState title="No articles found" description="Try changing your search or product-family filter." />}
        {articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase text-blue-600">{article.family?.name || 'General'}</span><span className="text-xs text-slate-400">{article.views} views</span></div>
                  <h2 className="mt-4 !text-xl !font-semibold text-slate-900"><Link to={`/knowledge-base/${article.slug}`} className="hover:text-blue-600">{article.title}</Link></h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{article.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>{article.helpful_count} found helpful</span><Link to={`/knowledge-base/${article.slug}`} className="font-semibold text-blue-600">Read article</Link></div>
                </article>
              ))}
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white"><Pagination meta={query.data.meta} onPageChange={setPage} /></div>
          </>
        )}
      </div>
    </SelfServicePage>
  )
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
function SelfServicePage({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
