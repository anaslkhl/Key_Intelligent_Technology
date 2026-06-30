export default function UsersActivityTable({ data }) {
  const rows = Array.isArray(data) ? data : []
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">User Activity</h2>
        <p className="mt-1 text-sm text-slate-500">User engagement and login activity</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Last Login</th>
              <th className="px-5 py-3">Logins</th>
              <th className="px-5 py-3">Actions</th>
              <th className="px-5 py-3">Last Action</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No user activity recorded yet. Activity logs will appear as users interact with the platform.</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id} className={i < rows.length - 1 ? 'border-b border-slate-100' : ''}>
                <td className="px-5 py-3">
                  <span className="font-medium text-slate-700">{row.name}</span>
                  <span className="ml-2 text-slate-400">{row.email}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    row.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{row.role}</span>
                </td>
                <td className="px-5 py-3 text-slate-700">{row.last_login ? new Date(row.last_login).toLocaleString() : '-'}</td>
                <td className="px-5 py-3 text-slate-700">{row.total_logins}</td>
                <td className="px-5 py-3 text-slate-700">{row.total_actions}</td>
                <td className="px-5 py-3 text-slate-500">{row.last_action ? new Date(row.last_action).toLocaleString() : '-'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
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
