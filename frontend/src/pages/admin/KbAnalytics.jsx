import { useQuery } from '@tanstack/react-query'
import { Eye, Search, ThumbsDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import AdminPage from './AdminPage'

export default function KbAnalytics() {
  const query = useQuery({ queryKey: ['admin-kb-analytics'], queryFn: () => apiClient.get('/admin/knowledge-base/analytics').then((response) => response.data.data) })
  if (query.isLoading) return <AdminPage><LoadingState label="Loading knowledge-base analytics..." /></AdminPage>
  if (query.isError) return <AdminPage><ErrorState message="Unable to load knowledge-base analytics." onRetry={query.refetch} /></AdminPage>
  const data = query.data

  return <AdminPage><PageHeader eyebrow="Knowledge intelligence" title="Knowledge-base analytics" description="See what clients read, what they cannot find, and where content needs improvement." />
    <div className="mt-6 grid gap-5 xl:grid-cols-2"><AnalyticsCard title="Most viewed articles" description="Top 10 published articles" icon={Eye}><ArticleRows items={data.most_viewed} value={(item) => `${item.views} views`} /></AnalyticsCard><AnalyticsCard title="Least helpful articles" description="Lowest positive-feedback ratio" icon={ThumbsDown}><ArticleRows items={data.least_helpful} value={(item) => `${item.helpful_ratio}% helpful`} /></AnalyticsCard><AnalyticsCard title="Most searched keywords" description="Top 10 submitted searches" icon={TrendingUp}><SearchRows items={data.most_searched} /></AnalyticsCard><AnalyticsCard title="Searches with no results" description="Content gaps worth addressing" icon={Search}><SearchRows items={data.no_result_searches} empty="No unsuccessful searches recorded." /></AnalyticsCard></div>
  </AdminPage>
}

function AnalyticsCard({ title, description, icon: Icon, children }) { return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111]"><header className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40"><Icon size={19} /></span><div><h2 className="!text-lg !font-semibold text-slate-900 dark:text-white">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></header><div className="mt-5">{children}</div></section> }
function ArticleRows({ items, value }) { if (!items.length) return <p className="text-sm text-slate-500">No article data yet.</p>; const maximum = Math.max(...items.map((item) => Number(item.views || 0)), 1); return <ol className="grid gap-3">{items.map((item, index) => <li key={item.id}><div className="flex items-center justify-between gap-4 text-sm"><Link to={`/knowledge-base/${item.slug}`} className="min-w-0 truncate font-semibold text-slate-800 hover:text-blue-600 dark:text-zinc-200">{index + 1}. {item.title}</Link><span className="shrink-0 text-xs text-slate-500">{value(item)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><span className="block h-full rounded-full bg-blue-600" style={{ width: `${Math.max(4, (Number(item.views || 0) / maximum) * 100)}%` }} /></div></li>)}</ol> }
function SearchRows({ items, empty = 'No searches recorded.' }) { if (!items.length) return <p className="text-sm text-slate-500">{empty}</p>; return <ol className="divide-y divide-slate-100 dark:divide-zinc-800">{items.map((item, index) => <li key={item.keyword} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-zinc-200">{index + 1}. {item.display_query}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{item.searches}</span></li>)}</ol> }
