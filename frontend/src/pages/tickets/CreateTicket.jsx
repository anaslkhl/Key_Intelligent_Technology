import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'

export default function CreateTicket() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [familyId, setFamilyId] = useState('')
  const { register, handleSubmit, control, setValue, setError, formState: { errors } } = useForm({ defaultValues: { priority: 'medium', title: searchParams.get('title') || '', description: searchParams.get('context') || '' } })
  const robotId = useWatch({ control, name: 'robot_id' })
  const familiesQuery = useQuery({ queryKey: ['families'], queryFn: () => apiClient.get('/families').then((response) => response.data.data) })
  const robotsQuery = useQuery({ queryKey: ['robots', 'options'], queryFn: () => apiClient.get('/robots', { params: { per_page: 50 } }).then((response) => response.data.data) })
  const families = useMemo(() => familiesQuery.data || [], [familiesQuery.data])
  const robots = useMemo(() => robotsQuery.data || [], [robotsQuery.data])
  const family = families.find((item) => item.id === familyId)
  const availableRobots = useMemo(() => robots.filter((robot) => !familyId || robot.product?.family?.id === familyId), [familyId, robots])
  const selectedRobot = robots.find((robot) => robot.id === robotId)

  const mutation = useMutation({
    mutationFn: async (values) => {
      let attachments = []
      const files = Array.from(values.files || [])

      if (files.length > 0) {
        const formData = new FormData()
        files.forEach((file) => formData.append('files[]', file))
        const uploadResponse = await apiClient.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        attachments = uploadResponse.data.data.map((upload) => upload.file_path)
      }

      const { files: ignoredFiles, ...ticketData } = values
      void ignoredFiles
      return apiClient.post('/tickets', { ...ticketData, attachments })
    },
    onSuccess: (response) => {
      toast.success('Ticket created successfully')
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      navigate(`/tickets/${response.data.data.id}`)
    },
    onError: (error) => {
      const apiError = parseApiError(error, 'Unable to create ticket')
      applyFieldErrors(setError, apiError.fieldErrors)
      setError('root.server', { message: apiError.message })
    },
  })

  const isLoading = familiesQuery.isLoading || robotsQuery.isLoading
  const hasError = familiesQuery.isError || robotsQuery.isError

  return (
    <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Client support" title="Create a ticket" description="Tell us which robot needs attention and what happened." />
        <div className="mt-6">
          {isLoading && <LoadingState label="Loading support options..." />}
          {hasError && <ErrorState message="Unable to load robots and product families." onRetry={() => { familiesQuery.refetch(); robotsQuery.refetch() }} />}
          {!isLoading && !hasError && robots.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Register a robot before creating a support ticket. <Link to="/robots/register" className="font-semibold underline">Register robot</Link></div>
          )}
          {!isLoading && !hasError && robots.length > 0 && (
            <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {errors.root?.server && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Product family" error={errors.family_id?.message}>
                  <select value={familyId} onChange={(event) => { setFamilyId(event.target.value); setValue('robot_id', ''); setValue('category_id', '') }} className={inputClass} required>
                    <option value="">Select family</option>
                    {families.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </Field>
                <Field label="Robot" error={errors.robot_id?.message}>
                  <select className={inputClass} {...register('robot_id', { required: 'Select a robot' })}>
                    <option value="">Select robot</option>
                    {availableRobots.map((robot) => <option key={robot.id} value={robot.id}>{robot.name || robot.product?.model} · {robot.serial_number}</option>)}
                  </select>
                </Field>
                <Field label="Product model">
                  <input className={`${inputClass} bg-slate-100`} value={selectedRobot?.product ? `${selectedRobot.product.model} · ${selectedRobot.product.name}` : ''} placeholder="Selected from robot" readOnly />
                </Field>
                <Field label="Category" error={errors.category_id?.message}>
                  <select className={inputClass} disabled={!family} {...register('category_id', { required: 'Select a category' })}>
                    <option value="">Select category</option>
                    {(family?.ticket_categories || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="mt-5 grid gap-5">
                <Field label="Title" error={errors.title?.message}><input className={inputClass} placeholder="Short summary of the issue" {...register('title', { required: 'Title is required', maxLength: 255 })} /></Field>
                <Field label="Description" error={errors.description?.message}><textarea rows="6" className={`${inputClass} min-h-36 py-3`} placeholder="Describe what happened, when it started, and any troubleshooting attempted." {...register('description', { required: 'Description is required' })} /></Field>
                <Field label="Priority" error={errors.priority?.message}>
                  <select className={inputClass} {...register('priority', { required: true })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Critical</option></select>
                </Field>
                <Field label="Attachments" hint="Up to 5 JPG, PNG, GIF, WebP, PDF, or MP4 files. Maximum 5 MB each." error={errors.files?.message}>
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.mp4" className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700" {...register('files', { validate: (files) => !files?.length || files.length <= 5 || 'Maximum 5 files' })} />
                </Field>
              </div>
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link to="/tickets" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Cancel</Link><button type="submit" disabled={mutation.isPending} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending ? 'Creating...' : 'Create ticket'}</button></div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

function Field({ label, hint, error, children }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span>{children}{hint && <small className="font-normal text-slate-500">{hint}</small>}{error && <small className="font-normal text-red-600">{error}</small>}</label>
}
