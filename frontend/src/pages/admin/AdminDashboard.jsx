import { useQuery } from '@tanstack/react-query'
import { BookOpen, Download, Star, TicketCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import apiClient from '../../api/client'
import ChartCard, { chartTooltipStyle } from '../../components/admin/ChartCard'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import { AdminPage } from './shared'

const cards = [
  ['Users', 'total_users', Users, 'text-blue-600'],
  ['Tickets', 'total_tickets', TicketCheck, 'text-cyan-600'],
  ['Open tickets', 'open_tickets', TicketCheck, 'text-amber-600'],
  ['Pending reviews', 'pending_reviews', Star, 'text-violet-600'],
]

export default function AdminDashboard() {
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: () => apiClient.get('/admin/stats').then((response) => response.data.data) })
  const analytics = useQuery({ queryKey: ['admin-analytics'], queryFn: () => apiClient.get('/admin/analytics').then((response) => response.data.data) })
  if (stats.isLoading || analytics.isLoading) return <AdminPage><LoadingState label="Loading administration overview..." /></AdminPage>
  if (stats.isError || analytics.isError) return <AdminPage><ErrorState message="Unable to load the admin dashboard." onRetry={() => { stats.refetch(); analytics.refetch() }} /></AdminPage>
  const data = analytics.data

  return <AdminPage><PageHeader eyebrow="Administration" title="Admin dashboard" description="Monitor support performance, content, and client engagement." actions={<Link to="/admin/export" className="button button-secondary"><Download size={17} />Export data</Link>} />
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, key, Icon, tone]) => <article key={key} className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{label}</p><Icon size={20} className={tone} /></div><strong className="mt-4 block text-3xl text-slate-900">{stats.data[key] ?? 0}</strong></article>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><ChartCard title="Ticket volume" description="Requests created during the last 30 days"><ResponsiveContainer><LineChart data={data.ticket_volume}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip contentStyle={chartTooltipStyle} /><Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="CSAT trend" description="Average customer satisfaction by day"><ResponsiveContainer><LineChart data={data.csat_trend}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 5]} tick={{ fontSize: 11 }} /><Tooltip contentStyle={chartTooltipStyle} /><Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="Tickets by status" description="Current workflow distribution"><ResponsiveContainer><BarChart data={data.tickets_by_status}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="status" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip contentStyle={chartTooltipStyle} /><Legend /><Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard><section className="grid gap-6 sm:grid-cols-2"><Ranking title="Top KB articles" icon={BookOpen} rows={data.popular_kb} value={(row) => `${row.views} views`} /><Ranking title="Popular features" icon={Star} rows={data.popular_features} value={(row) => `${row.upvotes_count} votes`} /></section></div>
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5"><h2 className="!text-lg !font-semibold text-slate-900">Quick actions</h2><div className="mt-4 flex flex-wrap gap-3"><Link to="/admin/users" className="button button-secondary">Manage users</Link><Link to="/admin/reviews" className="button button-secondary">Moderate reviews</Link><Link to="/admin/features" className="button button-secondary">Feature roadmap</Link><Link to="/admin/analytics" className="button button-primary">View analytics</Link></div></section>
  </AdminPage>
}

function Ranking({ title, icon: Icon, rows = [], value }) { return <div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><Icon size={18} className="text-blue-600" /><h2 className="!text-base !font-semibold text-slate-900">{title}</h2></div><div className="mt-4 grid gap-3">{rows.length ? rows.map((row) => <div key={row.id} className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3"><span className="line-clamp-2 text-sm font-semibold text-slate-700">{row.title}</span><span className="shrink-0 text-xs text-slate-500">{value(row)}</span></div>) : <p className="text-sm text-slate-500">No data available.</p>}</div></div> }
