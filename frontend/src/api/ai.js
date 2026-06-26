import apiClient from './client'

export async function sendMessage(prompt) {
  const response = await apiClient.post('/ai/chat', { prompt })

  return response.data.data
}
