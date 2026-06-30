export default function PageViewsChart({ data = [] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Page Views</h2>
        <p className="mt-1 text-sm text-slate-500">Most viewed pages (last 30 days)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
              <th className="px-5 py-3">Path</th>
              <th className="px-5 py-3">Views</th>
              <th className="px-5 py-3">Unique</th>
              <th className="px-5 py-3">Avg Time (ms)</th>
              <th className="px-5 py-3">Last Viewed</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No page view data available.</td></tr>
            )}
            {data.map((row, i) => (
              <tr key={row.path} className={i < data.length - 1 ? 'border-b border-slate-100' : ''}>
                <td className="max-w-xs truncate px-5 py-3 font-medium text-slate-700">{row.path}</td>
                <td className="px-5 py-3 text-slate-700">{row.views}</td>
                <td className="px-5 py-3 text-slate-700">{row.unique_visitors}</td>
                <td className="px-5 py-3 text-slate-700">{row.avg_time_on_page}</td>
                <td className="px-5 py-3 text-slate-500">{row.last_viewed ? new Date(row.last_viewed).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
