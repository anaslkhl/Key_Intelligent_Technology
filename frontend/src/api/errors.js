export function parseApiError(error, fallback = 'Something went wrong. Please try again.') {
  const response = error.response?.data
  const fieldErrors = {}

  if (response?.errors && typeof response.errors === 'object') {
    Object.entries(response.errors).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages)
    })
  }

  return {
    message: response?.message || error.message || fallback,
    fieldErrors,
    status: error.response?.status,
  }
}

export function applyFieldErrors(setError, fieldErrors) {
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field, { type: 'server', message })
  })
}
