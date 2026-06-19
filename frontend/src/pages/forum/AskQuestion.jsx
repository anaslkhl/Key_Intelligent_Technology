import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import PageHeader from '../../components/common/PageHeader'

export default function AskQuestion() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, setError, formState: { errors } } = useForm()
  const mutation = useMutation({
    mutationFn: (values) => apiClient.post('/forum/questions', { ...values, tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5) : [] }),
    onSuccess: (response) => { toast.success('Question posted'); queryClient.invalidateQueries({ queryKey: ['forum-questions'] }); navigate(`/forum/${response.data.data.id}`) },
    onError: (error) => { const apiError = parseApiError(error, 'Unable to post question'); applyFieldErrors(setError, apiError.fieldErrors); setError('root.server', { message: apiError.message }) },
  })

  return (
    <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageHeader eyebrow="KIT community" title="Ask a question" description="Describe the issue clearly so the community can help." />
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {errors.root?.server && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}
          <div className="grid gap-5">
            <Field label="Title" error={errors.title?.message}><input className={inputClass} placeholder="What do you need help with?" {...register('title', { required: 'Title is required', maxLength: 255 })} /></Field>
            <Field label="Details" error={errors.content?.message}><textarea rows="9" className={`${inputClass} min-h-52 py-3`} placeholder="Include product model, symptoms, and what you already tried." {...register('content', { required: 'Details are required', maxLength: 10000 })} /></Field>
            <Field label="Tags" hint="Separate up to 5 tags with commas." error={errors.tags?.message}><input className={inputClass} placeholder="AMR, navigation, battery" {...register('tags', { validate: (value) => !value || value.split(',').filter(Boolean).length <= 5 || 'Maximum 5 tags' })} /></Field>
          </div>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link to="/forum" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Cancel</Link><button type="submit" disabled={mutation.isPending} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending ? 'Posting...' : 'Post question'}</button></div>
        </form>
      </div>
    </section>
  )
}


const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
function Field({ label, hint, error, children }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span>{children}{hint && <small className="font-normal text-slate-500">{hint}</small>}{error && <small className="font-normal text-red-600">{error}</small>}</label> }
