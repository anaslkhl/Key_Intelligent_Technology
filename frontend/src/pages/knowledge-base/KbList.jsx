import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronRight, Clock3, Eye, Heart, History, Search, TrendingUp, Wrench } from 'lucide-react'
import { useDeferredValue, useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { KB_CATEGORIES, categoryLabel, categoryStyles } from '../../utils/knowledgeBase'
import { useAuth } from '../../contexts/auth'
import { useDebounce } from '../../hooks/useDebounce'

export default function KbList() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('q') || ''
  const [draftSearch, setDraftSearch] = useState(initialSearch)
  const [search, setSearch] = useState(initialSearch)
  const [familyId, setFamilyId] = useState(searchParams.get('family_id') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(1)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  
  const debouncedSearch = useDebounce(draftSearch.trim(), 400)
  const familiesQuery = useQuery({ queryKey: ['families'], queryFn: () => apiClient.get('/families').then((response) => response.data.data) })
  const highlightsQuery = useQuery({ queryKey: ['kb-highlights', isAuthenticated], queryFn: () => apiClient.get('/knowledge-base/highlights').then((response) => response.data.data), staleTime: 60_000 })
  const suggestionsQuery = useQuery({ queryKey: ['kb-suggestions', debouncedSearch], queryFn: () => apiClient.get('/knowledge-base/suggest', { params: { q: debouncedSearch } }).then((response) => response.data.data), enabled: debouncedSearch.length >= 2, staleTime: 30_000 })
  
  const query = useQuery({
    queryKey: ['knowledge-base', { search: debouncedSearch, familyId, category, page }],
    queryFn: () => apiClient.get('/knowledge-base', { params: { q: debouncedSearch || undefined, family_id: familyId || undefined, category: category || undefined, page, per_page: 9 } }).then((response) => response.data.data),
  })
  
  const articles = query.data?.data || []
  const suggestions = suggestionsQuery.data || []

  // Auto-search when debouncedSearch changes
  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      setSearch(debouncedSearch)
      setPage(1)
      updateUrl({ search: debouncedSearch })
    }
  }, [debouncedSearch])

  const updateUrl = (next = {}) => {
    const values = { q: next.search ?? search, family_id: next.familyId ?? familyId, category: next.category ?? category }
    setSearchParams(Object.fromEntries(Object.entries(values).filter(([, value]) => value)))
  }
  
  const submitSearch = (event) => { 
    event.preventDefault()
    const term = draftSearch.trim()
    setSearch(term)
    updateUrl({ search: term })
    setSuggestionsOpen(false)
    setPage(1)
  }
  
  const chooseSuggestion = (suggestion) => { 
    setSuggestionsOpen(false)
    navigate(`/knowledge-base/${suggestion.slug}`)
  }
  
  const handleSearchKey = (event) => {
    if (!suggestionsOpen || suggestions.length === 0) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveSuggestion((current) => (current + 1) % suggestions.length) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1)) }
    if (event.key === 'Enter' && activeSuggestion >= 0) { event.preventDefault(); chooseSuggestion(suggestions[activeSuggestion]) }
    if (event.key === 'Escape') setSuggestionsOpen(false)
  }

  return (
    <SelfServicePage>
      <KbBreadcrumb category={category} />
      <PageHeader 
        eyebrow="Self-service support" 
        title="Knowledge base" 
        description="Search product guidance, maintenance instructions, and troubleshooting articles." 
        actions={<Link to="/error-codes" className="button button-secondary"><Wrench size={17} />Error codes</Link>} 
      />
      
      <form onSubmit={submitSearch} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#111111] lg:grid-cols-[minmax(0,1fr)_220px_240px]">
        <div className="relative">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Search
            <span className="relative">
              <Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
              <input 
                value={draftSearch} 
                onFocus={() => setSuggestionsOpen(true)} 
                onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)} 
                onChange={(event) => { 
                  setDraftSearch(event.target.value)
                  setSuggestionsOpen(true)
                  setActiveSuggestion(-1)
                }} 
                onKeyDown={handleSearchKey} 
                placeholder="Type to search articles..." 
                className={`${inputClass} pl-9`} 
                role="combobox" 
                aria-autocomplete="list" 
                aria-expanded={suggestionsOpen && suggestions.length > 0} 
                aria-controls="kb-suggestions" 
              />
            </span>
          </label>
          {suggestionsOpen && debouncedSearch.length >= 2 && (
            <div id="kb-suggestions" role="listbox" className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-[#111111]">
              {suggestionsQuery.isFetching && <p className="px-4 py-3 text-sm text-slate-500">Finding articles...</p>}
              {!suggestionsQuery.isFetching && suggestions.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No title suggestions found.</p>}
              {suggestions.map((suggestion, index) => (
                <button 
                  key={suggestion.id} 
                  type="button" 
                  role="option" 
                  aria-selected={index === activeSuggestion} 
                  onMouseDown={(event) => event.preventDefault()} 
                  onClick={() => chooseSuggestion(suggestion)} 
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-zinc-900 ${index === activeSuggestion ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}
                >
                  <span className="min-w-0 truncate font-semibold text-slate-800 dark:text-zinc-100">{suggestion.title}</span>
                  <span className="shrink-0 text-xs text-slate-500">{suggestion.reading_time} min</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">
          Category
          <select value={category} onChange={(event) => { const value = event.target.value; setCategory(value); updateUrl({ category: value }); setPage(1) }} className={inputClass}>
            <option value="">All categories</option>
            {KB_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">
          Product family
          <select value={familyId} onChange={(event) => { const value = event.target.value; setFamilyId(value); updateUrl({ familyId: value }); setPage(1) }} className={inputClass}>
            <option value="">All families</option>
            {(familiesQuery.data || []).map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}
          </select>
        </label>
      </form>

      {!debouncedSearch && !familyId && !category && (
        <div className="mt-8 grid gap-6">
          <HighlightShelf title="Most viewed" description="The guidance clients rely on most." icon={TrendingUp} articles={highlightsQuery.data?.most_viewed} isLoading={highlightsQuery.isLoading} />
          <HighlightShelf title="Most helpful" description="Articles with the most positive feedback." icon={Heart} articles={highlightsQuery.data?.most_helpful} isLoading={highlightsQuery.isLoading} />
          {isAuthenticated && (highlightsQuery.isLoading || highlightsQuery.data?.recently_viewed?.length > 0) && (
            <HighlightShelf title="Recently viewed" description="Pick up where you left off." icon={History} articles={highlightsQuery.data?.recently_viewed} isLoading={highlightsQuery.isLoading} />
          )}
        </div>
      )}

      <div className="mt-6">
        {query.isLoading && <LoadingState label="Searching knowledge base..." />}
        {query.isError && <ErrorState message="Unable to load knowledge-base articles." onRetry={query.refetch} />}
        {query.isSuccess && articles.length === 0 && <EmptyState title="No articles found" description="Try changing your search, category, or product-family filter." />}
        {articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111111]">
              <Pagination meta={query.data.meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </SelfServicePage>
  )
}

export function ArticleCard({ article }) {
  return (
    <article className="flex min-h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-[#111111]">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${categoryStyles[article.category]}`}>{categoryLabel(article.category)}</span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Eye size={14} />{article.views}</span>
      </div>
      <p className="mt-4 text-xs font-bold uppercase text-blue-600">{article.family?.name || 'General support'}</p>
      <h2 className="mt-2 !text-xl !font-semibold text-slate-900 dark:text-white">
        <Link to={`/knowledge-base/${article.slug}`} className="hover:text-blue-600">{article.title}</Link>
      </h2>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-zinc-400">{article.excerpt}</p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-zinc-800">
        <span className="inline-flex items-center gap-1"><Clock3 size={14} />{article.reading_time} min read</span>
        <Link to={`/knowledge-base/${article.slug}`} className="inline-flex items-center gap-1 font-semibold text-blue-600">Read article<ChevronRight size={14} /></Link>
      </div>
    </article>
  )
}

function HighlightShelf({ title, description, icon: Icon, articles = [], isLoading }) {
  return (
    <section aria-labelledby={`shelf-${title.replaceAll(' ', '-').toLowerCase()}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id={`shelf-${title.replaceAll(' ', '-').toLowerCase()}`} className="flex items-center gap-2 !text-xl !font-semibold text-slate-900 dark:text-white">
            <Icon size={20} className="text-blue-600" />{title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <div className="mt-3 grid auto-cols-[minmax(245px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 xl:grid-flow-row xl:grid-cols-5 xl:overflow-visible">
        {isLoading && Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111111]" />)}
        {articles.map((article, index) => (
          <Link key={article.id} to={`/knowledge-base/${article.slug}`} className="group flex min-h-32 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-[#111111] dark:hover:border-blue-800">
            <span className="text-xs font-bold text-blue-600">{String(index + 1).padStart(2, '0')} · {categoryLabel(article.category)}</span>
            <strong className="mt-2 line-clamp-2 text-sm text-slate-900 group-hover:text-blue-600 dark:text-white">{article.title}</strong>
            <span className="mt-auto flex items-center justify-between pt-3 text-xs text-slate-500"><span>{article.reading_time} min</span><span>{article.views} views</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function KbBreadcrumb({ category, title }) {
  return (
    <nav aria-label="Knowledge base breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link to="/" className="font-semibold hover:text-blue-600">Home</Link>
      <ChevronRight size={14} />
      {category ? (
        <Link to={`/knowledge-base?category=${category}`} className="font-semibold hover:text-blue-600">{categoryLabel(category)}</Link>
      ) : (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
          <BookOpen size={14} />Knowledge Base
        </span>
      )}
      {title && (
        <>
          <ChevronRight size={14} />
          <span className="max-w-md truncate font-semibold text-slate-800 dark:text-zinc-100" aria-current="page">{title}</span>
        </>
      )}
    </nav>
  )
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none dark:border-zinc-700 dark:bg-[#111111] dark:text-white'

export function SelfServicePage({ children }) {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900 dark:bg-black dark:text-white sm:py-10">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}