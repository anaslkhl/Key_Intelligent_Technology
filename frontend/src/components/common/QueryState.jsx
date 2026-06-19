import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="state-panel loading-panel" role="status" aria-live="polite">
      <LoaderCircle className="state-spinner" size={24} aria-hidden="true" />
      <span>{label}</span>
      <div className="skeleton-lines" aria-hidden="true"><i /><i /><i /></div>
    </div>
  )
}

export function ErrorState({ message = 'Unable to load this information.', onRetry }) {
  return (
    <div className="state-panel error-panel" role="alert">
      <span className="state-icon error"><AlertCircle size={22} /></span>
      <h2>Something went wrong</h2>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="button button-secondary button-md">Try again</button>}
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="state-panel empty-panel">
      <span className="state-icon"><Inbox size={24} /></span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="state-action">{action}</div>}
    </div>
  )
}
