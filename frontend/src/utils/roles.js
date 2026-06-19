export const ROLE_HOME = {
  client: '/dashboard',
  agent: '/agent/tickets',
  admin: '/admin/dashboard',
}

export function getRoleHome(role) {
  return ROLE_HOME[role] || '/dashboard'
}

export const ROLE_LABELS = {
  client: 'Client',
  agent: 'Support agent',
  admin: 'Administrator',
}
