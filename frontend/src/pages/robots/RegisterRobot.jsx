import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../api/client'
import { applyFieldErrors, parseApiError } from '../../api/errors'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'

export default function RegisterRobot() {
  const [familyId, setFamilyId] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, getValues, setValue, setError, formState: { errors } } = useForm()
  const familiesQuery = useQuery({ queryKey: ['families'], queryFn: () => apiClient.get('/families').then((response) => response.data.data) })
  const family = (familiesQuery.data || []).find((item) => item.id === familyId)
  const mutation = useMutation({
    mutationFn: (values) => apiClient.post('/robots', values),
    onSuccess: () => {
      toast.success('Robot registered successfully')
      queryClient.invalidateQueries({ queryKey: ['robots'] })
      navigate('/robots')
    },
    onError: (error) => {
      const apiError = parseApiError(error, 'Unable to register robot')
      applyFieldErrors(setError, apiError.fieldErrors)
      setError('root.server', { message: apiError.message })
    },
  })

  return (
    <section className="min-h-[calc(100vh-143px)] bg-slate-50 py-8 text-slate-900 sm:py-10">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Installed fleet" title="Register a robot" description="Add a KIT Robotics system to your support account." />
        <div className="mt-6">
          {familiesQuery.isLoading && <LoadingState label="Loading product catalog..." />}
          {familiesQuery.isError && <ErrorState message="Unable to load the product catalog." onRetry={familiesQuery.refetch} />}
          {familiesQuery.isSuccess && (
            <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {errors.root?.server && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</div>}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Product family">
                  <select value={familyId} onChange={(event) => { setFamilyId(event.target.value); setValue('product_id', '') }} className={inputClass} required>
                    <option value="">Select family</option>
                    {familiesQuery.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </Field>
                <Field label="Product model" error={errors.product_id?.message}>
                  <select className={inputClass} disabled={!family} {...register('product_id', { required: 'Select a product model' })}>
                    <option value="">Select product</option>
                    {(family?.products || []).map((product) => <option key={product.id} value={product.id}>{product.model} · {product.name}</option>)}
                  </select>
                </Field>
                <Field label="Serial number" error={errors.serial_number?.message}><input className={inputClass} placeholder="Manufacturer serial number" {...register('serial_number', { required: 'Serial number is required', maxLength: 255 })} /></Field>
                <Field label="Robot name" hint="Optional friendly name" error={errors.name?.message}><input className={inputClass} placeholder="Warehouse AMR 01" {...register('name', { maxLength: 255 })} /></Field>
                <Field label="Purchase date" error={errors.purchase_date?.message}><input type="date" className={inputClass} {...register('purchase_date')} /></Field>
                <Field label="Warranty end" error={errors.warranty_end?.message}>
                  <input type="date" className={inputClass} {...register('warranty_end', { validate: (value) => !value || !getValues('purchase_date') || value > getValues('purchase_date') || 'Warranty end must be after purchase date' })} />
                </Field>
              </div>
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link to="/robots" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Cancel</Link><button type="submit" disabled={mutation.isPending} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{mutation.isPending ? 'Registering...' : 'Register robot'}</button></div>
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
