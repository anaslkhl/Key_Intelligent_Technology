import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartTooltipStyle } from './chartConfig'

export default function VisitorsChart({ data }) {
  const rows = Array.isArray(data) ? data : []

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Daily Unique Visitors</h2>
        <p className="mt-1 text-sm text-slate-500">Unique IP addresses per day (last 30 days)</p>
      </div>
      <div className="h-64 w-full">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No visitor data available yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="unique_visitors" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} name="Visitors" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
