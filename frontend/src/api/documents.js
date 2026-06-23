import apiClient from './client'

export const documentTypes = ['pdf', 'image', 'video', 'presentation', 'other']
export const documentVisibilities = ['client', 'internal', 'restricted']

export const getDocuments = (params = {}) => apiClient.get('/documents', { params }).then((response) => response.data)
export const getDocument = (slugOrId) => apiClient.get(`/documents/${slugOrId}`).then((response) => response.data.data)
export const getDocumentPreview = (id) => apiClient.get(`/documents/${id}/preview`).then((response) => response.data.data)

export async function downloadDocument(document, suppliedUrl = null) {
  const preview = suppliedUrl ? null : await getDocumentPreview(document.id)
  const downloadUrl = normalizeApiUrl(suppliedUrl || preview?.download_url || document.upload?.url)

  if (!downloadUrl) throw new Error('You do not have permission to download this document.')

  const response = await apiClient.get(downloadUrl, { responseType: 'blob' })
  const objectUrl = URL.createObjectURL(response.data)
  const anchor = window.document.createElement('a')
  anchor.href = objectUrl
  anchor.download = document.upload?.original_name || `${document.slug || 'document'}.${extensionFor(document.document_type)}`
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}

export function normalizeApiUrl(url) {
  if (!url) return null

  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.pathname.replace(/^\/api(?=\/)/, '') + parsed.search
  } catch {
    return url.replace(/^\/api(?=\/)/, '')
  }
}

export function inferDocumentType(fileName = '') {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
  if (extension === 'mp4') return 'video'
  if (extension === 'pptx') return 'presentation'
  return 'other'
}

function extensionFor(type) {
  return { pdf: 'pdf', image: 'jpg', video: 'mp4', presentation: 'pptx' }[type] || 'bin'
}
