import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartTooltipStyle } from './chartConfig'

export default function PageViewsChartBar({ data }) {
  const rows = Array.isArray(data) ? data : []

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Top Pages</h2>
        <p className="mt-1 text-sm text-slate-500">Most visited pages (last 30 days)</p>
      </div>
      <div className="h-64 w-full">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No page view data available yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="path" tick={{ fontSize: 10 }} width={140} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="views" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Views" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
