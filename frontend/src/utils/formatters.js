export function formatDate(value, options = {}) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(value))
}

export function formatDateTime(value) {
  return formatDate(value, { hour: '2-digit', minute: '2-digit' })
}
