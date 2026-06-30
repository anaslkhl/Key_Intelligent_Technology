import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartTooltipStyle } from './chartConfig'

export default function AIUsageChart({ data }) {
  const messages = data?.messages_per_day ?? []
  const total = data?.total_messages ?? 0
  const avgResponse = data?.avg_response_time ?? 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">AI Chat Usage</h2>
        <p className="mt-1 text-sm text-slate-500">Messages per day (last 30 days)</p>
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-violet-50 px-4 py-3">
          <p className="text-xs font-semibold text-violet-600">Total Messages</p>
          <strong className="text-2xl text-violet-900">{total}</strong>
        </div>
        <div className="rounded-lg bg-rose-50 px-4 py-3">
          <p className="text-xs font-semibold text-rose-600">Avg Response Time</p>
          <strong className="text-2xl text-rose-900">{avgResponse}ms</strong>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={messages}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Messages" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
