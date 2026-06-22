import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Eye, LifeBuoy, List, TicketCheck, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { parseApiError } from '../../api/errors'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { useAuth } from '../../contexts/auth'
import { formatDate } from '../../utils/formatters'
import { categoryLabel, categoryStyles, parseMarkdownHeadings, remarkHeadingIds } from '../../utils/knowledgeBase'
import { KbBreadcrumb, SelfServicePage } from './KbList'

export default function KbDetail() {
  const { slug } = useParams()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['knowledge-base', slug], queryFn: () => apiClient.get(`/knowledge-base/${slug}`).then((response) => response.data.data) })
  const feedback = useMutation({ mutationFn: (helpful) => apiClient.post(`/knowledge-base/${query.data.id}/feedback`, { helpful }), onSuccess: (response) => { toast.success('Thanks for your feedback'); queryClient.setQueryData(['knowledge-base', slug], (current) => current ? { ...current, ...response.data.data } : current) }, onError: (error) => toast.error(parseApiError(error, 'Unable to record feedback').message) })

  if (query.isLoading) return <SelfServicePage><LoadingState label="Loading article..." /></SelfServicePage>
  if (query.isError) return <SelfServicePage><ErrorState message="Unable to load this article." onRetry={query.refetch} /></SelfServicePage>

  return <Article article={query.data} isAuthenticated={isAuthenticated} feedback={feedback} />
}

function Article({ article, isAuthenticated, feedback }) {
  const articleRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [tocOpen, setTocOpen] = useState(false)
  const headings = useMemo(() => parseMarkdownHeadings(article.content), [article.content])
  const showToc = headings.length >= 3
  const ticketParams = new URLSearchParams({ title: `Help with: ${article.title}`, context: `I still need help after reading the knowledge-base article "${article.title}".\n\nArticle: ${window.location.href}`, article_slug: article.slug })
  if (article.family?.id) ticketParams.set('family_id', article.family.id)
  if (article.product?.id) ticketParams.set('product_id', article.product.id)
  if (article.suggested_ticket_category_id) ticketParams.set('category_id', article.suggested_ticket_category_id)

  useEffect(() => {
    let frame
    const updateProgress = () => {
      frame = undefined
      const element = articleRef.current
      if (!element) return
      const start = element.getBoundingClientRect().top + window.scrollY
      const distance = Math.max(element.offsetHeight - window.innerHeight, 1)
      setProgress(Math.min(100, Math.max(0, ((window.scrollY - start) / distance) * 100)))
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(updateProgress) }
    updateProgress()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); if (frame) window.cancelAnimationFrame(frame) }
  }, [])

  useEffect(() => {
    if (!tocOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [tocOpen])

  return <SelfServicePage><div className="fixed inset-x-0 top-16 z-40 h-1 bg-slate-200/80 dark:bg-zinc-900" role="progressbar" aria-label="Article reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}><span className="block h-full bg-blue-600 transition-[width] duration-100" style={{ width: `${progress}%` }} /></div><KbBreadcrumb category={article.category} title={article.title} /><div className={`grid items-start gap-6 ${showToc ? 'xl:grid-cols-[minmax(0,1fr)_260px]' : ''}`}><article ref={articleRef} className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111] sm:p-8 lg:p-10 ${showToc ? '' : 'mx-auto w-full max-w-4xl'}`}><header className="border-b border-slate-200 pb-7 dark:border-zinc-800"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${categoryStyles[article.category]}`}>{categoryLabel(article.category)}</span>{article.family && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{article.family.name}</span>}</div><h1 className="mt-4 !text-3xl !font-bold text-slate-900 dark:text-white sm:!text-4xl">{article.title}</h1><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 size={15} />{article.reading_time} min read</span><span className="inline-flex items-center gap-1"><Eye size={15} />{article.views} views</span><span>Updated: {formatDate(article.updated_at)}</span>{article.product && <span>{article.product.model}</span>}</div></header>
        {showToc && <button type="button" onClick={() => setTocOpen(true)} className="button button-secondary mt-6 w-full justify-center xl:hidden" aria-haspopup="dialog"><List size={17} />Table of contents</button>}
        <div className="kb-markdown mt-7"><ReactMarkdown remarkPlugins={[remarkHeadingIds]}>{article.content}</ReactMarkdown></div>
        <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-800 dark:bg-zinc-950"><h2 className="!text-base !font-semibold text-slate-900 dark:text-white">Was this article helpful?</h2>{isAuthenticated ? <div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={feedback.isPending} onClick={() => feedback.mutate(true)} className="button button-success button-sm">Yes, helpful</button><button type="button" disabled={feedback.isPending} onClick={() => feedback.mutate(false)} className="button button-secondary button-sm">Not helpful</button></div> : <p className="mt-2 text-sm text-slate-600"><Link to="/login" className="font-semibold text-blue-600">Log in</Link> to leave feedback.</p>}<p className="mt-3 text-xs text-slate-500">{article.helpful_count} helpful · {article.not_helpful_count} not helpful</p></section>
        <section className="mt-6 flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-[#111111]"><LifeBuoy size={20} /></span><div><h2 className="!text-base !font-semibold text-slate-900 dark:text-white">Still need help?</h2><p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Send this article’s context to the KIT support team.</p></div></div><Link to={`/tickets/create?${ticketParams}`} className="button button-primary shrink-0"><TicketCheck size={17} />Create a ticket</Link></section>
        {article.related_articles?.length > 0 && <section className="mt-10 border-t border-slate-200 pt-8 dark:border-zinc-800"><h2 className="!text-xl !font-semibold text-slate-900 dark:text-white">Related articles</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{article.related_articles.map((related) => <Link key={related.id} to={`/knowledge-base/${related.slug}`} className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold uppercase ${categoryStyles[related.category]}`}>{categoryLabel(related.category)}</span><strong className="mt-3 block text-sm text-slate-900 dark:text-white">{related.title}</strong><span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} />{related.reading_time} min read</span></Link>)}</div></section>}
      </article>{showToc && <aside className="sticky top-24 hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111] xl:block"><p className="text-xs font-bold uppercase text-blue-600">On this page</p><TocLinks headings={headings} className="mt-4" /></aside>}</div>{showToc && tocOpen && <div className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-sm xl:hidden" role="presentation" onMouseDown={() => setTocOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="mobile-toc-title" className="absolute inset-x-0 bottom-0 max-h-[78vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-[#111111]" onMouseDown={(event) => event.stopPropagation()}><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-700" /><div className="flex items-center justify-between gap-4"><h2 id="mobile-toc-title" className="!text-lg !font-semibold text-slate-900 dark:text-white">Table of contents</h2><button type="button" onClick={() => setTocOpen(false)} className="icon-button" aria-label="Close table of contents"><X size={18} /></button></div><TocLinks headings={headings} className="mt-5" onNavigate={() => setTocOpen(false)} /></section></div>}</SelfServicePage>
}

function TocLinks({ headings, className = '', onNavigate }) { return <nav aria-label="Table of contents" className={`grid gap-2 ${className}`}>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} onClick={onNavigate} className={`rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-950/30 ${heading.level === 2 ? 'ml-3' : heading.level === 3 ? 'ml-6 text-xs' : 'font-semibold'}`}>{heading.text}</a>)}</nav> }
