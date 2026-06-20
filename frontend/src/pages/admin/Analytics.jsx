import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import apiClient from '../../api/client'
import ChartCard from '../../components/admin/ChartCard'
import { chartTooltipStyle } from '../../components/admin/chartConfig'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import AdminPage from './AdminPage'

export default function Analytics() {
  const query = useQuery({ queryKey: ['admin-analytics'], queryFn: () => apiClient.get('/admin/analytics').then((response) => response.data.data) })
  if (query.isLoading) return <AdminPage><LoadingState label="Loading analytics..." /></AdminPage>
  if (query.isError) return <AdminPage><ErrorState message="Unable to load analytics." onRetry={query.refetch} /></AdminPage>
  const data = query.data

  return <AdminPage><PageHeader eyebrow="Administration" title="Support analytics" description="Track ticket demand, customer satisfaction, and resolution performance." actions={<Link to="/admin/export" className="button button-primary"><Download size={17} />Export CSV</Link>} />
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="Average CSAT" value={`${data.csat_average || 0}/5`} /><Metric label="30-day tickets" value={data.ticket_volume.reduce((sum, row) => sum + Number(row.count), 0)} /><Metric label="Tracked statuses" value={data.tickets_by_status.length} /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><ChartCard title="Ticket volume" description="New requests by day"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.ticket_volume}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip contentStyle={chartTooltipStyle} /><Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="CSAT trend" description="Daily satisfaction average"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.csat_trend}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 5]} /><Tooltip contentStyle={chartTooltipStyle} /><Bar dataKey="average" fill="#10b981" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Resolution time" description="Average hours from creation to resolved/closed"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.resolution_time}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis unit="h" /><Tooltip contentStyle={chartTooltipStyle} /><Line type="monotone" dataKey="hours" stroke="#f59e0b" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="Tickets by status" description="Current queue distribution"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.tickets_by_status}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="status" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip contentStyle={chartTooltipStyle} /><Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard></div>
  </AdminPage>
}

function Metric({ label, value }) { return <article className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><strong className="mt-3 block text-3xl text-slate-900">{value}</strong></article> }
