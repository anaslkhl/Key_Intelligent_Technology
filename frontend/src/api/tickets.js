import apiClient from './client'

export function getAgentTickets(params = {}) {
  return apiClient
    .get('/agent/tickets', { params })
    .then((response) => response.data)
}

export function getTicketFamilies() {
  return apiClient
    .get('/families')
    .then((response) => response.data.data)
}

export function getAgentStaff() {
  return apiClient
    .get('/agent/staff')
    .then((response) => response.data.data)
}
