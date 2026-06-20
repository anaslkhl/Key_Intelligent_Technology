import { useMutation } from '@tanstack/react-query'
import { Download, FileSpreadsheet, TicketCheck, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import PageHeader from '../../components/common/PageHeader'
import { AdminPage, inputClass } from './shared'

export default function ExportData() {
  const { register, getValues, formState: { errors } } = useForm()
  const download = useMutation({ mutationFn: async ({ type, values }) => { const response = await apiClient.get(`/admin/export/${type}`, { params: values, responseType: 'blob' }); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url) }, onSuccess: () => toast.success('CSV download started'), onError: () => toast.error('Unable to export data') })
  const values = () => { const data = getValues(); return { date_from: data.date_from || undefined, date_to: data.date_to || undefined } }

  return <AdminPage><PageHeader eyebrow="Administration" title="Export data" description="Download user and support-ticket records for reporting or analysis." />
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="state-icon"><FileSpreadsheet size={22} /></span><div><h2 className="!text-lg !font-semibold text-slate-900">Date range</h2><p className="mt-1 text-sm text-slate-500">Leave both fields empty to export all available records.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-slate-700">From<input type="date" className={inputClass} {...register('date_from')} /></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700">To<input type="date" className={inputClass} {...register('date_to', { validate: (value, form) => !value || !form.date_from || value >= form.date_from || 'End date must be after the start date' })} />{errors.date_to && <span className="text-xs text-red-600">{errors.date_to.message}</span>}</label></div></section>
    <div className="mt-6 grid gap-6 md:grid-cols-2"><ExportCard icon={Users} title="Users CSV" description="Name, email, role, account status, and creation date." busy={download.isPending} onClick={() => download.mutate({ type: 'users', values: values() })} /><ExportCard icon={TicketCheck} title="Tickets CSV" description="Title, status, priority, client, robot, CSAT, and creation date." busy={download.isPending} onClick={() => download.mutate({ type: 'tickets', values: values() })} /></div>
  </AdminPage>
}

function ExportCard({ icon: Icon, title, description, busy, onClick }) { return <article className="rounded-lg border border-slate-200 bg-white p-6"><span className="state-icon"><Icon size={22} /></span><h2 className="mt-5 !text-xl !font-semibold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><button type="button" onClick={onClick} disabled={busy} className="button button-primary mt-6"><Download size={17} />Download CSV</button></article> }
