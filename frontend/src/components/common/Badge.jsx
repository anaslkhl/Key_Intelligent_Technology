const statusStyles = {
  new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  open: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  waiting_client: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  resolved: 'bg-green-50 text-green-700 ring-green-600/20',
  closed: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

const priorityStyles = {
  critical: 'bg-red-50 text-red-700 ring-red-600/20',
  urgent: 'bg-red-50 text-red-700 ring-red-600/20',
  high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  low: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

function label(value) {
  return String(value || 'unknown').replaceAll('_', ' ')
}

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ring-1 ring-inset ${statusStyles[status] || statusStyles.closed}`}>
      {label(status)}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`status-badge inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ring-1 ring-inset ${priorityStyles[priority] || priorityStyles.low}`}>
      {label(priority)}
    </span>
  )
}
