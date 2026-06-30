export default function SessionsTable({ data }) {
  const rows = Array.isArray(data) ? data : []
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Active Sessions</h2>
        <p className="mt-1 text-sm text-slate-500">Currently active and idle sessions</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
              <th className="px-5 py-3">Session</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">IP Address</th>
              <th className="px-5 py-3">Device</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Last Activity</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No active sessions right now. Sessions appear when users are browsing the platform.</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.session_id} className={i < rows.length - 1 ? 'border-b border-slate-100' : ''}>
                <td className="max-w-[120px] truncate px-5 py-3 font-mono text-xs text-slate-500">{row.session_id}</td>
                <td className="px-5 py-3">
                  {row.user ? (
                    <span><span className="font-medium text-slate-700">{row.user.name}</span><span className="ml-2 text-slate-400">{row.user.email}</span></span>
                  ) : (
                    <span className="text-slate-400">Guest</span>
                  )}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.ip_address}</td>
                <td className="px-5 py-3 text-slate-700">{row.device}</td>
                <td className="px-5 py-3 text-slate-700">{row.duration > 0 ? `${row.duration}m` : '&lt;1m'}</td>
                <td className="px-5 py-3 text-slate-500">{row.last_activity ? new Date(row.last_activity).toLocaleString() : '-'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
