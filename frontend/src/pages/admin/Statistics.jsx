import { useQuery, useMutation } from '@tanstack/react-query'
import { BarChart3, Download, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import AIUsageChart from '../../components/admin/AIUsageChart'
import PageViewsChart from '../../components/admin/PageViewsChart'
import SessionsTable from '../../components/admin/SessionsTable'
import StatisticsOverview from '../../components/admin/StatisticsOverview'
import TicketStatsCard from '../../components/admin/TicketStatsCard'
import UsersActivityTable from '../../components/admin/UsersActivityTable'
import PageHeader from '../../components/common/PageHeader'
import { ErrorState, LoadingState } from '../../components/common/QueryState'
import AdminPage from './AdminPage'

export default function Statistics() {
  const [days, setDays] = useState(30)

  const overview = useQuery({
    queryKey: ['admin-statistics', 'overview'],
    queryFn: () => apiClient.get('/admin/statistics/overview').then((r) => r.data),
    refetchInterval: 60_000,
  })

  const pageViews = useQuery({
    queryKey: ['admin-statistics', 'page-views', days],
    queryFn: () => apiClient.get('/admin/statistics/page-views', { params: { days } }).then((r) => r.data),
  })

  const userActivity = useQuery({
    queryKey: ['admin-statistics', 'users-activity', days],
    queryFn: () => apiClient.get('/admin/statistics/users-activity', { params: { days } }).then((r) => r.data),
  })

  const sessions = useQuery({
    queryKey: ['admin-statistics', 'sessions'],
    queryFn: () => apiClient.get('/admin/statistics/sessions').then((r) => r.data),
    refetchInterval: 30_000,
  })

  const aiUsage = useQuery({
    queryKey: ['admin-statistics', 'ai-usage', days],
    queryFn: () => apiClient.get('/admin/statistics/ai-usage', { params: { days } }).then((r) => r.data),
  })

  const tickets = useQuery({
    queryKey: ['admin-statistics', 'tickets'],
    queryFn: () => apiClient.get('/admin/statistics/tickets').then((r) => r.data),
  })

  const exportMutation = useMutation({
    mutationFn: async (type) => {
      const response = await apiClient.get(`/admin/statistics/export`, {
        params: { type },
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => toast.success('CSV download started'),
    onError: () => toast.error('Unable to export data'),
  })

  const isAnyLoading = overview.isLoading || pageViews.isLoading || userActivity.isLoading || sessions.isLoading || aiUsage.isLoading || tickets.isLoading
  const isAnyError = overview.isError || pageViews.isError || userActivity.isError || sessions.isError || aiUsage.isError || tickets.isError

  if (isAnyLoading) return <AdminPage><LoadingState label="Loading statistics..." /></AdminPage>
  if (isAnyError) return <AdminPage><ErrorState message="Unable to load statistics data." onRetry={() => { overview.refetch(); pageViews.refetch(); userActivity.refetch(); sessions.refetch(); aiUsage.refetch(); tickets.refetch() }} /></AdminPage>

  const hasNoData = overview.data && (
    overview.data.total_users === 0 &&
    overview.data.page_views_today === 0 &&
    overview.data.ai_messages_today === 0 &&
    overview.data.active_sessions === 0
  )

  return (
    <AdminPage>
      <PageHeader
        eyebrow="Administration"
        title="Statistics & Analytics"
        description="Comprehensive platform analytics, user activity, and performance metrics."
        actions={
          <div className="flex flex-wrap gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button type="button" onClick={() => exportMutation.mutate('page-views')} disabled={exportMutation.isPending} className="button button-secondary">
              <Download size={16} /> Page Views
            </button>
            <button type="button" onClick={() => exportMutation.mutate('user-activity')} disabled={exportMutation.isPending} className="button button-secondary">
              <Download size={16} /> Activity
            </button>
            <button type="button" onClick={() => { overview.refetch(); pageViews.refetch(); userActivity.refetch(); sessions.refetch(); aiUsage.refetch(); tickets.refetch() }} className="button button-primary">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        }
      />

      {hasNoData && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2 font-semibold">
            <BarChart3 size={18} />
            <span>No statistics data collected yet</span>
          </div>
          <p className="mt-1 ml-7">Data will appear once users interact with the platform. Try running <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-mono">php artisan db:seed --class=StatisticsSeeder</code> to generate sample data for testing.</p>
        </div>
      )}

      <div className="mt-6">
        <StatisticsOverview data={overview.data} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AIUsageChart data={aiUsage.data} />
        <TicketStatsCard data={tickets.data} />
      </div>

      <div className="mt-6">
        <PageViewsChart data={pageViews.data} />
      </div>

      <div className="mt-6">
        <UsersActivityTable data={userActivity.data} />
      </div>

      <div className="mt-6">
        <SessionsTable data={sessions.data} />
      </div>
    </AdminPage>
  )
}
