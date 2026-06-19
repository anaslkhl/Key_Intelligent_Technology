export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-sm" role="status">
      {label}
    </div>
  )
}

export function ErrorState({ message = 'Unable to load this information.', onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
      <p className="font-semibold">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-100">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="!text-lg !font-semibold !text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
