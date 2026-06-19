import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function ConfirmDialog({ isOpen, title, message, confirmLabel, isBusy, onCancel, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isBusy) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBusy, isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={() => !isBusy && onCancel()}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="dialog-icon"><AlertTriangle size={22} /></span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button type="button" className="button button-secondary" onClick={onCancel} disabled={isBusy}>Cancel</button>
          <button type="button" className="button button-danger" onClick={onConfirm} disabled={isBusy} autoFocus>
            {isBusy ? 'Signing out...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
