import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, BookOpen, Search, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import { EmptyState, ErrorState, LoadingState } from '../../components/common/QueryState'
import { SelfServicePage } from './KbList'

const severities = ['low', 'medium', 'high', 'critical']
const severityStyles = {
  low: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  high: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
}

export default function ErrorCodeList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState(searchParams.get('q') || '')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [familyId, setFamilyId] = useState(searchParams.get('family_id') || '')
  const [productId, setProductId] = useState(searchParams.get('product_id') || '')
  const [severity, setSeverity] = useState(searchParams.get('severity') || '')
  const [page, setPage] = useState(1)
  const familiesQuery = useQuery({ queryKey: ['families'], queryFn: () => apiClient.get('/families').then((response) => response.data.data) })
  const products = useMemo(() => (familiesQuery.data || []).flatMap((family) => family.products.map((product) => ({ ...product, family }))).filter((product) => !familyId || product.family_id === familyId), [familiesQuery.data, familyId])
  const query = useQuery({ queryKey: ['error-codes', { search, familyId, productId, severity, page }], queryFn: () => apiClient.get('/error-codes', { params: { q: search || undefined, family_id: familyId || undefined, product_id: productId || undefined, severity: severity || undefined, page, per_page: 12 } }).then((response) => response.data) })
  const codes = query.data?.data || []

  const syncUrl = (overrides = {}) => {
    const values = { q: overrides.search ?? search, family_id: overrides.familyId ?? familyId, product_id: overrides.productId ?? productId, severity: overrides.severity ?? severity }
    setSearchParams(Object.fromEntries(Object.entries(values).filter(([, value]) => value)))
  }
  const submit = (event) => { event.preventDefault(); const term = draft.trim(); setSearch(term); syncUrl({ search: term }); setPage(1) }

  return <SelfServicePage><nav className="mb-6 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb"><Link to="/" className="font-semibold hover:text-blue-600">Home</Link><span>/</span><Link to="/knowledge-base" className="font-semibold hover:text-blue-600">Knowledge Base</Link><span>/</span><span className="font-semibold text-slate-800 dark:text-zinc-100">Error Codes</span></nav><PageHeader eyebrow="Diagnostic reference" title="Error code library" description="Find causes and recommended solutions by robot model, code, or symptom." />
    <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[#111111] lg:grid-cols-[minmax(240px,1fr)_200px_220px_160px_auto]">
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">Code or keyword<span className="relative"><Search size={17} className="absolute left-3 top-3.5 text-slate-400" /><input value={draft} onChange={(event) => setDraft(event.target.value)} className={`${inputClass} pl-9`} placeholder="e.g. E-104, navigation" /></span></label>
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">Family<select value={familyId} onChange={(event) => { const value = event.target.value; setFamilyId(value); setProductId(''); syncUrl({ familyId: value, productId: '' }); setPage(1) }} className={inputClass}><option value="">All families</option>{(familiesQuery.data || []).map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">Product<select value={productId} onChange={(event) => { setProductId(event.target.value); syncUrl({ productId: event.target.value }); setPage(1) }} className={inputClass}><option value="">All products</option>{products.map((product) => <option key={product.id} value={product.id}>{product.model} · {product.name}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">Severity<select value={severity} onChange={(event) => { setSeverity(event.target.value); syncUrl({ severity: event.target.value }); setPage(1) }} className={inputClass}><option value="">All levels</option>{severities.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
      <button type="submit" className="button button-primary self-end"><Search size={17} />Search</button>
    </form>
    <div className="mt-6">{query.isLoading && <LoadingState label="Searching error codes..." />}{query.isError && <ErrorState message="Unable to load the error-code library." onRetry={query.refetch} />}{query.isSuccess && codes.length === 0 && <EmptyState title="No error codes found" description="Try another code, product, or keyword." />}{codes.length > 0 && <><div className="grid gap-4 lg:grid-cols-2">{codes.map((item) => <ErrorCodeCard key={item.id} item={item} />)}</div><div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111111]"><Pagination meta={query.data.meta} onPageChange={setPage} /></div></>}</div>
  </SelfServicePage>
}

function ErrorCodeCard({ item }) { return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#111111]"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40"><Wrench size={19} /></span><div><p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{item.code}</p><p className="text-xs text-slate-500">{item.product ? `${item.product.model} · ${item.product.name}` : 'General'}</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${severityStyles[item.severity]}`}><AlertTriangle size={12} className="mr-1 inline" />{item.severity}</span></div><h2 className="mt-5 !text-lg !font-semibold text-slate-900 dark:text-white">{item.meaning}</h2><dl className="mt-4 grid gap-4 text-sm"><div><dt className="font-semibold text-slate-800 dark:text-zinc-200">Likely cause</dt><dd className="mt-1 leading-6 text-slate-600 dark:text-zinc-400">{item.cause}</dd></div><div className="rounded-lg bg-slate-50 p-4 dark:bg-zinc-950"><dt className="font-semibold text-slate-800 dark:text-zinc-200">Recommended solution</dt><dd className="mt-1 leading-6 text-slate-600 dark:text-zinc-400">{item.solution}</dd></div></dl>{item.article && <Link to={`/knowledge-base/${item.article.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"><BookOpen size={16} />Read related article</Link>}</article> }

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-[#111111] dark:text-white dark:focus:ring-blue-900'
