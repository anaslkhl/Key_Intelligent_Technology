import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { Link, useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { KB_CATEGORIES } from '../../utils/knowledgeBase'

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function KbForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const familiesQuery = useQuery({ queryKey: ['families'], queryFn: () => apiClient.get('/families').then((response) => response.data.data) })
  const articleQuery = useQuery({ queryKey: ['kb-manage-article', id], queryFn: () => apiClient.get(`/kb-articles/${id}`).then((response) => response.data.data), enabled: isEditing })
  const { register, handleSubmit, control, reset, setValue, setError, formState: { errors, dirtyFields } } = useForm({ defaultValues: { title: '', slug: '', content: '', category: 'getting_started', family_id: '', product_id: '', tags: '', is_published: false } })
  useEffect(() => { if (articleQuery.data && familiesQuery.data) reset({ title: articleQuery.data.title, slug: articleQuery.data.slug, content: articleQuery.data.content, category: articleQuery.data.category || 'getting_started', family_id: articleQuery.data.family?.id || '', product_id: articleQuery.data.product?.id || '', tags: (articleQuery.data.tags || []).join(', '), is_published: articleQuery.data.is_published }) }, [articleQuery.data, familiesQuery.data, reset])
  const familyId = useWatch({ control, name: 'family_id' })
  const productId = useWatch({ control, name: 'product_id' })
  const content = useWatch({ control, name: 'content' })
  const products = useMemo(() => familiesQuery.data?.find((family) => family.id === familyId)?.products || [], [familiesQuery.data, familyId])
  useEffect(() => { if (productId && products.length > 0 && !products.some((product) => product.id === productId)) setValue('product_id', '') }, [productId, products, setValue])
  const save = useMutation({ mutationFn: (values) => isEditing ? apiClient.put(`/kb-articles/${id}`, values) : apiClient.post('/kb-articles', values), onSuccess: () => { toast.success(isEditing ? 'Article updated' : 'Article created'); navigate('/agent/kb/manage') }, onError: (error) => { const parsed = parseApiError(error, 'Unable to save article'); applyFieldErrors(setError, parsed.fieldErrors); setError('root.server', { message: parsed.message }) } })
  const submit = (values) => save.mutate({ ...values, family_id: values.family_id || null, product_id: values.product_id || null, tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean), is_published: Boolean(values.is_published) })

  if (isEditing && (articleQuery.isLoading || familiesQuery.isLoading)) return <AgentPage><LoadingState label="Loading article..." /></AgentPage>
  if (articleQuery.isError || familiesQuery.isError) return <AgentPage><ErrorState message="Unable to load the article editor." onRetry={() => { articleQuery.refetch(); familiesQuery.refetch() }} /></AgentPage>

  return <AgentPage><PageHeader eyebrow="Knowledge operations" title={isEditing ? 'Edit article' : 'Create article'} description="Write support content in Markdown and target it to a product family or model." />
    <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)]"><div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">{errors.root?.server && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}<Field label="Title" error={errors.title}><input className={inputClass} {...register('title', { required: 'Title is required', maxLength: 255, onChange: (event) => { if (!dirtyFields.slug) setValue('slug', slugify(event.target.value)) } })} /></Field><Field label="Slug" error={errors.slug}><input className={inputClass} {...register('slug', { required: 'Slug is required', maxLength: 255 })} /></Field><Field label="Article category" error={errors.category}><select className={inputClass} {...register('category', { required: 'Category is required' })}>{KB_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Product family" error={errors.family_id}><Controller control={control} name="family_id" render={({ field }) => <select className={inputClass} {...field} onChange={(event) => { field.onChange(event); setValue('product_id', '') }}><option value="">All families</option>{familiesQuery.data?.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</select>} /></Field><Field label="Product model" error={errors.product_id}><Controller control={control} name="product_id" render={({ field }) => <select className={inputClass} disabled={!familyId} {...field}><option value="">All models</option>{products.map((product) => <option key={product.id} value={product.id}>{product.model} · {product.name}</option>)}</select>} /></Field></div><Field label="Tags" hint="Comma-separated" error={errors.tags}><input className={inputClass} placeholder="maintenance, battery, amr" {...register('tags')} /></Field><Field label="Markdown content" error={errors.content}><textarea rows="16" className="w-full rounded-lg border p-3 font-mono text-sm" {...register('content', { required: 'Content is required' })} /></Field><label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" className="h-4 w-4" {...register('is_published')} />Publish immediately</label><div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><Link to="/agent/kb/manage" className="button button-secondary">Cancel</Link><button type="submit" disabled={save.isPending} className="button button-primary">{save.isPending ? 'Saving...' : 'Save article'}</button></div></div><aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 sm:p-6 xl:sticky xl:top-20"><p className="text-xs font-bold uppercase text-blue-600">Markdown preview</p><div className="kb-markdown mt-4">{content ? <ReactMarkdown>{content}</ReactMarkdown> : <p>Your formatted article will appear here.</p>}</div></aside></form>
  </AgentPage>
}

function Field({ label, hint, error, children }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}{hint && <small className="ml-2 font-normal text-slate-500">{hint}</small>}</span>{children}{error && <span className="text-xs text-red-600">{error.message}</span>}</label> }
const inputClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900'
function AgentPage({ children }) { return <section className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 text-slate-900"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
