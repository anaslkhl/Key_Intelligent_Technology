import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'

export default function WriteReview() {
  const [rating, setRating] = useState(5)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const robotsQuery = useQuery({ queryKey: ['robots', 'review-options'], queryFn: () => apiClient.get('/robots', { params: { per_page: 50 } }).then((response) => response.data.data) })
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm({ defaultValues: { rating: 5 } })
  const mutation = useMutation({
    mutationFn: (values) => apiClient.post('/reviews', { ...values, rating: Number(values.rating) }),
    onSuccess: () => { toast.success('Review submitted for approval'); queryClient.invalidateQueries({ queryKey: ['my-reviews'] }); navigate('/reviews/my') },
    onError: (error) => { const apiError = parseApiError(error, 'Unable to submit review'); applyFieldErrors(setError, apiError.fieldErrors); setError('root.server', { message: apiError.message }) },
  })

  if (robotsQuery.isLoading) return <Page><LoadingState label="Loading your robots..." /></Page>
  if (robotsQuery.isError) return <Page><ErrorState message="Unable to load your robots." onRetry={robotsQuery.refetch} /></Page>
  const robots = robotsQuery.data || []

  return (
    <Page>
      <PageHeader eyebrow="Product feedback" title="Write a review" description="Share your experience with a robot registered to your account." />
      <div className="mt-6">
        {robots.length === 0 ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Register a robot before writing a review. <Link to="/robots/register" className="font-semibold underline">Register robot</Link></div> : (
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {errors.root?.server && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}
            <div className="grid gap-5">
              <Field label="Robot" error={errors.robot_id?.message}><select className={inputClass} {...register('robot_id', { required: 'Select a robot' })}><option value="">Select robot</option>{robots.map((robot) => <option key={robot.id} value={robot.id}>{robot.name || robot.product?.model} · {robot.product?.name}</option>)}</select></Field>
              <Field label="Rating" error={errors.rating?.message}><div className="flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} stars`} onClick={() => { setRating(value); setValue('rating', value, { shouldValidate: true }) }} className={`grid h-11 w-11 place-items-center rounded-lg border text-xl ${value <= rating ? 'border-amber-400 bg-amber-50 text-amber-500' : 'border-slate-300 text-slate-300'}`}>★</button>)}</div><input type="hidden" {...register('rating', { required: true, min: 1, max: 5 })} /></Field>
              <Field label="Title" hint="Optional" error={errors.title?.message}><input className={inputClass} placeholder="Summarize your experience" {...register('title', { maxLength: 255 })} /></Field>
              <Field label="Review" hint="Optional" error={errors.comment?.message}><textarea rows="6" className={`${inputClass} min-h-36 py-3`} placeholder="What worked well? What could improve?" {...register('comment', { maxLength: 5000 })} /></Field>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Pros" hint="Optional" error={errors.pros?.message}><textarea rows="4" className={`${inputClass} min-h-28 py-3`} placeholder="Key strengths" {...register('pros', { maxLength: 2000 })} /></Field><Field label="Cons" hint="Optional" error={errors.cons?.message}><textarea rows="4" className={`${inputClass} min-h-28 py-3`} placeholder="Areas to improve" {...register('cons', { maxLength: 2000 })} /></Field></div>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link to="/reviews/my" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Cancel</Link><button type="submit" disabled={mutation.isPending} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending ? 'Submitting...' : 'Submit review'}</button></div>
          </form>
        )}
      </div>
    </Page>
  )
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
function Field({ label, hint, error, children }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span>{children}{hint && <small className="font-normal text-slate-500">{hint}</small>}{error && <small className="font-normal text-red-600">{error}</small>}</label> }
function Page({ children }) { return <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10"><div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">{children}</div></section> }
